import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { OTP_LENGTH, OTP_TTL_MINUTES, RESEND_COOLDOWN_SECONDS } from "@/lib/authRules";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Password-reset OTP engine: mint, verify, and burn one-time codes.
 *
 * All state lives in Supabase (`public.password_reset_otps`, see
 * scripts/sql/001_password_reset_otps.sql) rather than in a module-level Map,
 * because route handlers run on short-lived, horizontally-scaled instances — an
 * in-memory limiter would reset on every cold start and be trivially bypassed by
 * spreading requests across instances.
 *
 * Every limit is enforced by a SQL function, not by reading a count here and
 * acting on it. A JS-side check-then-act leaves a window where N concurrent
 * requests all read the same pre-write state and all pass, which turns "5
 * guesses per code" into "5 per burst" and makes a 6-digit code brute-forceable.
 * The functions serialize with an advisory lock or a conditional UPDATE.
 *
 * Server-only: it uses the service-role Supabase client.
 */

const TABLE = "password_reset_otps";

/**
 * OTP_LENGTH / OTP_TTL_MINUTES / RESEND_COOLDOWN_SECONDS are shared with the
 * client and live in authRules. The ceilings below are server-only — telling the
 * client how many guesses remain in aggregate would just help an attacker pace
 * themselves.
 */

/** Wrong guesses before a code is burned. Reserved atomically, so a burst can't exceed it. */
export const MAX_VERIFY_ATTEMPTS = 5;
/** Ceiling per address per hour, so one mailbox can't be flooded. */
export const MAX_REQUESTS_PER_EMAIL_PER_HOUR = 5;
/** Ceiling per source IP per hour, so one client can't enumerate or spray. */
export const MAX_REQUESTS_PER_IP_PER_HOUR = 20;
/** How long the post-verification ticket stays valid — time to type a new password. */
export const RESET_TICKET_TTL_MINUTES = 10;

/**
 * Volume ceiling for /verify, per source IP. The per-code `attempts` counter
 * caps guesses against one specific code; this caps how fast an attacker can
 * work through many codes and many addresses at once, which the per-code counter
 * cannot see.
 *
 * Intentionally not per-email — see claim_password_reset_verify_slot in the
 * migration. An email-scoped ceiling here would let anyone lock a victim out of
 * verifying with junk requests.
 */
const VERIFY_WINDOW_MINUTES = 10;
const MAX_VERIFY_PER_IP_PER_WINDOW = 30;

/**
 * Keys both the stored code hash and the reset ticket signature. Reusing
 * NEXTAUTH_SECRET keeps the deploy story to one secret; it is already required
 * and already treated as the app's signing key.
 */
function signingSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required to sign password-reset codes. See .env.example.");
  }
  return secret;
}

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/**
 * Cryptographically secure numeric code. `randomInt` draws from the CSPRNG and
 * rejects modulo bias, unlike `Math.random()` or `% 1000000` on a random byte.
 * Padded so codes with leading zeros are still full length.
 */
export function generateOtp(): string {
  const max = 10 ** OTP_LENGTH;
  return String(randomInt(0, max)).padStart(OTP_LENGTH, "0");
}

/**
 * HMAC rather than a bare SHA-256: the code space is only 10^6, so an unkeyed
 * digest of a stolen database is reversible by brute force in milliseconds.
 * Keying it means a DB dump without the app secret yields nothing.
 */
const hashOtp = (code: string): string =>
  createHmac("sha256", signingSecret()).update(code).digest("hex");

/** Constant-time comparison so a wrong code can't be narrowed by response timing. */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

interface OtpRow {
  id: string;
  email: string;
  user_id: string | null;
  code_hash: string;
  expires_at: string;
  attempts: number;
  verified_at: string | null;
  consumed_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Issue
// ---------------------------------------------------------------------------

export type IssueResult =
  | { status: "ok"; code: string; expiresInMinutes: number }
  | { status: "probe_recorded" }
  | { status: "cooldown" | "rate_limited"; retryAfterSeconds: number };

interface ClaimResponse {
  status: "ok" | "cooldown" | "rate_limited";
  retry_after?: number;
}

/**
 * Claims a send slot and, if allowed, stores a fresh code — rate limits,
 * superseding the previous code, and the insert all happen inside one
 * transaction in `claim_password_reset_slot`.
 *
 * Pass `userId: null` for an address with no account: a row is still written
 * (born expired, so it can never verify) purely so probes are counted by the
 * same limiters as real requests. Because this flow reports `email_not_found` by
 * design, skipping that would leave enumeration entirely unthrottled — only real
 * accounts would ever leave a trace.
 *
 * The plaintext code is returned exactly once and is never readable again, since
 * only the HMAC is stored.
 */
export async function issueOtp({
  email,
  userId,
  ip,
}: {
  email: string;
  userId: string | null;
  ip: string | null;
}): Promise<IssueResult> {
  const code = userId ? generateOtp() : "";

  const { data, error } = await supabaseAdmin.rpc("claim_password_reset_slot", {
    p_email: email,
    p_user_id: userId,
    p_code_hash: userId ? hashOtp(code) : "",
    p_ip: ip,
    p_ttl_minutes: OTP_TTL_MINUTES,
    p_cooldown_seconds: RESEND_COOLDOWN_SECONDS,
    p_max_per_email: MAX_REQUESTS_PER_EMAIL_PER_HOUR,
    p_max_per_ip: MAX_REQUESTS_PER_IP_PER_HOUR,
  });

  if (error) throw new Error(`Could not claim reset slot: ${error.message}`);

  const result = data as ClaimResponse;
  if (result.status !== "ok") {
    return { status: result.status, retryAfterSeconds: result.retry_after ?? 60 };
  }

  if (!userId) return { status: "probe_recorded" };
  return { status: "ok", code, expiresInMinutes: OTP_TTL_MINUTES };
}

// ---------------------------------------------------------------------------
// Verify
// ---------------------------------------------------------------------------

export type VerifyResult =
  | { ok: true; ticket: string }
  | {
      ok: false;
      reason: "invalid_code" | "expired" | "too_many_attempts" | "rate_limited";
      attemptsLeft?: number;
    };

/**
 * Checks a submitted code against the newest live record for the address.
 *
 * "No record at all" and "record expired" both report `expired` — they are the
 * same thing from the user's side (request a new code), and collapsing them
 * avoids leaking whether an address ever had a code issued.
 */
export async function verifyOtp({
  email,
  code,
  ip,
}: {
  email: string;
  code: string;
  ip: string | null;
}): Promise<VerifyResult> {
  // Throttle the submission itself before touching the code. This is what stops
  // an attacker cycling codes and addresses at line rate; the per-code counter
  // below only bounds guesses against one specific code.
  const { data: allowed, error: limitError } = await supabaseAdmin.rpc(
    "claim_password_reset_verify_slot",
    {
      p_email: email,
      p_ip: ip,
      p_max_per_ip: MAX_VERIFY_PER_IP_PER_WINDOW,
      p_window_minutes: VERIFY_WINDOW_MINUTES,
    },
  );

  if (limitError) throw new Error(`Could not claim verify slot: ${limitError.message}`);
  // Fail closed: anything other than an explicit `true` is treated as denied,
  // so a null/undefined body can never be read as permission.
  if (allowed !== true) return { ok: false, reason: "rate_limited" };

  const { data } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("email", email)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<OtpRow>();

  if (!data) return { ok: false, reason: "expired" };
  if (new Date(data.expires_at).getTime() <= Date.now()) return { ok: false, reason: "expired" };
  // Already verified: the ticket was issued and is either in flight or spent.
  // Re-verifying would mint unlimited fresh tickets off one code.
  if (data.verified_at) return { ok: false, reason: "expired" };

  // Reserve the attempt BEFORE comparing. Comparing first and incrementing after
  // is the race that hands every request in a concurrent burst a free guess off
  // the same counter value.
  const { data: attempts, error: bumpError } = await supabaseAdmin.rpc(
    "bump_password_reset_attempt",
    { p_id: data.id, p_max: MAX_VERIFY_ATTEMPTS },
  );

  if (bumpError) throw new Error(`Could not record attempt: ${bumpError.message}`);
  // The function updates zero rows once the ceiling is reached (or the row is
  // spent), which surfaces as a null body. `== null` rather than `=== null` so an
  // absent body can't be read as a granted attempt — this must fail closed.
  if (attempts == null) return { ok: false, reason: "too_many_attempts" };

  const used = Number(attempts);

  if (!safeEqual(data.code_hash, hashOtp(code))) {
    if (used >= MAX_VERIFY_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };
    return { ok: false, reason: "invalid_code", attemptsLeft: MAX_VERIFY_ATTEMPTS - used };
  }

  // Conditional on verified_at still being null so two correct submissions in
  // flight together can't both mint a ticket.
  //
  // `expires_at` is pushed out to match the ticket's own lifetime. Without this
  // the row still died at issue-time + OTP_TTL_MINUTES while the ticket lived
  // for RESET_TICKET_TTL_MINUTES from *verification*, so a user who took four
  // minutes to fetch the code got six minutes to choose a password, not ten —
  // and the consume step then rejected a ticket the client had every reason to
  // believe was valid.
  const verifiedAt = new Date();
  const { data: marked } = await supabaseAdmin
    .from(TABLE)
    .update({
      verified_at: verifiedAt.toISOString(),
      expires_at: new Date(
        verifiedAt.getTime() + RESET_TICKET_TTL_MINUTES * 60_000,
      ).toISOString(),
    })
    .eq("id", data.id)
    .is("verified_at", null)
    .is("consumed_at", null)
    .select("id");

  if ((marked?.length ?? 0) === 0) return { ok: false, reason: "expired" };

  return {
    ok: true,
    ticket: issueResetTicket({ id: data.id, email, userId: data.user_id ?? "" }),
  };
}

// ---------------------------------------------------------------------------
// Reset ticket
// ---------------------------------------------------------------------------

interface TicketPayload {
  id: string;
  email: string;
  userId: string;
  exp: number;
}

const b64url = (input: string | Buffer): string =>
  Buffer.from(input as never).toString("base64url");

/**
 * Proof that this client just cleared the OTP step, so the confirm endpoint
 * doesn't have to accept the raw code a second time (which would mean holding it
 * in client state and replaying it over the wire).
 *
 * Signed, not encrypted — the payload is not secret; what matters is that it
 * cannot be forged. The DB row is still the source of truth: the ticket is only
 * an admission credential, and confirm re-checks verified/consumed/expiry.
 */
function issueResetTicket(input: Omit<TicketPayload, "exp">): string {
  const payload: TicketPayload = {
    ...input,
    exp: Date.now() + RESET_TICKET_TTL_MINUTES * 60_000,
  };
  const body = b64url(JSON.stringify(payload));
  const signature = createHmac("sha256", signingSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyResetTicket(ticket: string): TicketPayload | null {
  const [body, signature] = ticket.split(".");
  if (!body || !signature) return null;

  const expected = createHmac("sha256", signingSecret()).update(body).digest("base64url");
  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TicketPayload;
    if (typeof payload.exp !== "number" || payload.exp <= Date.now()) return null;
    if (!payload.id || !payload.email || !payload.userId) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Consume
// ---------------------------------------------------------------------------

/**
 * Burns the OTP record, permanently. Conditioned on `consumed_at is null` so two
 * concurrent confirm requests race in the database rather than in application
 * code — exactly one wins and the loser sees zero rows updated. Without that
 * predicate the same ticket could reset the password twice.
 *
 * The expiry predicate matters independently of the ticket's own TTL: requesting
 * a new code pushes the old row's `expires_at` into the past, and a ticket minted
 * before that must not still be spendable afterwards.
 */
export async function consumeOtpRecord(id: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from(TABLE)
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", id)
    .is("consumed_at", null)
    .not("verified_at", "is", null)
    .gt("expires_at", new Date().toISOString())
    .select("id");

  return (data?.length ?? 0) > 0;
}
