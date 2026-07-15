import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

/**
 * Password hashing via scrypt from node:crypto — memory-hard, in the standard
 * library, no native build step. bcrypt/argon2 are the usual picks; scrypt is
 * chosen here only to avoid adding a dependency for the MVP store.
 *
 * Cost parameters are stored per-hash (rather than read from a constant at
 * verify time) so they can be raised later without invalidating existing hashes.
 */
const N = 16384; // CPU/memory cost. 128 * N * r = 16MB, under node's 32MB maxmem default.
const R = 8;
const P = 1;
const KEYLEN = 64;
const SALT_BYTES = 16;

/** Serialized as `scrypt$N$r$p$salt$hash` — self-describing, so verify never guesses. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = await scrypt(password, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

/**
 * Constant-time verify. Returns false on any malformed/unknown hash rather than
 * throwing, so a corrupt record can never crash the login route.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // Anything non-string (a corrupt or hand-edited record) would throw on .split.
  if (typeof stored !== "string") return false;

  const [scheme, nRaw, rRaw, pRaw, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt") return false;
  if (nRaw === undefined || rRaw === undefined || pRaw === undefined) return false;
  if (saltHex === undefined || hashHex === undefined) return false;

  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return false;

  /**
   * Pin the cost parameters to the current constants rather than trusting the
   * record. They're stored to allow a future migration, but until one exists an
   * unexpected value can only be corruption or tampering, and honoring it is
   * harmful: a large `p` scales CPU linearly under node's maxmem cap (p=256 was
   * measured at ~6.7s per verify — a DoS), and a short `hashHex` would shrink
   * keylen far enough for random passwords to collide (a 1-byte digest matches
   * ~1/256 of the time). Reject instead. Widen this only alongside a migration.
   */
  if (n !== N || r !== R || p !== P) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  if (salt.length !== SALT_BYTES || expected.length !== KEYLEN) return false;

  try {
    const actual = await scrypt(password, salt, KEYLEN, { N: n, r, p });
    // Lengths match by construction, but timingSafeEqual throws if they ever don't.
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/**
 * Burn roughly one hash worth of CPU. Called when no user matches an email, so
 * "unknown email" and "wrong password" take comparable time — otherwise the
 * response latency itself tells an attacker which emails are registered.
 */
export async function fakeVerifyDelay(): Promise<void> {
  await scrypt("timing-equalizer", randomBytes(SALT_BYTES), KEYLEN, { N, r: R, p: P });
}
