import nodemailer, { type Transporter } from "nodemailer";

/**
 * The app's only outbound email transport. Server-only — it reads SMTP
 * credentials from the environment, so importing it from a client component
 * would leak them. Nothing client-side imports it (same guardrail as
 * src/lib/supabase/admin.ts).
 *
 * Configured for SMTP (defaults to Gmail, which is what the project uses — with
 * an App Password, not the account password; Gmail rejects plain passwords for
 * SMTP). Swapping to a transactional provider later means changing this file
 * alone: everything else goes through `sendMail`.
 *
 * The transport is created lazily and cached. Building it at import time would
 * make `next build` fail on any machine without SMTP credentials, since route
 * handlers are imported during the build.
 */

const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
/** Display sender. Falls back to the authenticated mailbox — Gmail rewrites a mismatched From anyway. */
const MAIL_FROM = process.env.MAIL_FROM ?? (SMTP_USER ? `TaskuTark <${SMTP_USER}>` : undefined);

let cached: Transporter | null = null;

function transport(): Transporter {
  if (cached) return cached;

  if (!SMTP_USER || !SMTP_PASSWORD) {
    // Loud and specific: a silent no-op here would look like "the email never
    // arrived", which is indistinguishable from a delivery problem.
    throw new Error(
      "Email is not configured. Set SMTP_USER and SMTP_PASSWORD (Gmail App Password). See .env.example.",
    );
  }

  cached = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    // 465 is implicit TLS; 587 upgrades via STARTTLS.
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  return cached;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  /** Plain-text alternative. Always send one — HTML-only mail scores badly with spam filters. */
  text: string;
}

/**
 * Sends one message. Throws on failure — callers decide whether that is fatal
 * (the reset flow treats it as fatal, so the user isn't told to check an inbox
 * that will stay empty).
 */
export async function sendMail(message: MailMessage): Promise<void> {
  await transport().sendMail({ from: MAIL_FROM, ...message });
}

/** True when SMTP credentials are present, so callers can degrade instead of throwing. */
export const isMailConfigured = (): boolean => Boolean(SMTP_USER && SMTP_PASSWORD);
