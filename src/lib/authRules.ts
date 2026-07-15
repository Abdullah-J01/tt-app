import { z } from "zod";

/**
 * Credential rules, shared by the client forms (src/components/auth/schemas.ts,
 * which wraps these with localized messages) and the server (the signup route +
 * the credentials provider). Client validation is a UX affordance and can be
 * skipped by anyone posting directly — the server schemas below are the ones
 * that actually enforce. Both read the same constants so they cannot drift.
 */

export const PASSWORD_MIN_LENGTH = 8;
/**
 * Upper bound so a huge password can't turn scrypt's memory-hard work into a
 * cheap DoS. Far above anything a password manager generates.
 */
export const PASSWORD_MAX_LENGTH = 200;
export const NAME_MAX_LENGTH = 80;
export const EMAIL_MAX_LENGTH = 254; // RFC 5321 practical limit.

/**
 * Server-side schemas. Messages here are developer-facing: API responses carry
 * a stable error *code* and the client maps it to a localized string, since the
 * translator only exists on the client.
 */
export const signupInputSchema = z.object({
  name: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  email: z.string().trim().max(EMAIL_MAX_LENGTH).pipe(z.email()),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
});
export type SignupInput = z.infer<typeof signupInputSchema>;

/**
 * Login checks shape and presence only, never the password policy — an account
 * created before a policy change must still be able to log in.
 */
export const loginInputSchema = z.object({
  email: z.string().trim().max(EMAIL_MAX_LENGTH).pipe(z.email()),
  password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
});
