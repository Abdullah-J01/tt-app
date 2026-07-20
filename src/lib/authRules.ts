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
 * Password-reset OTP shape. These three are shared with the client (the code
 * input renders OTP_LENGTH boxes, the resend button counts down
 * RESEND_COOLDOWN_SECONDS, the copy quotes OTP_TTL_MINUTES) so the UI can never
 * describe a policy the server doesn't enforce. The limits the client has no
 * business knowing — attempt ceilings, per-IP quotas — stay server-side in
 * src/lib/auth/passwordReset.ts.
 */
export const OTP_LENGTH = 6;
export const OTP_TTL_MINUTES = 10;
export const RESEND_COOLDOWN_SECONDS = 60;

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

/** Shared by the three password-reset endpoints. */
const resetEmailRule = z.string().trim().max(EMAIL_MAX_LENGTH).pipe(z.email());

export const passwordResetRequestSchema = z.object({
  email: resetEmailRule,
  /** Chooses the language of the OTP email. Unknown values fall back server-side. */
  locale: z.string().max(5).optional(),
});

export const passwordResetVerifySchema = z.object({
  email: resetEmailRule,
  code: z
    .string()
    .trim()
    .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Code must be ${OTP_LENGTH} digits`),
});

/**
 * The ticket is the proof of a passed OTP step; the raw code is deliberately not
 * accepted here, so it never has to be held in client state past verification.
 * Password rules are the signup rules — a reset must not be a way to set a
 * weaker password than sign-up allows.
 */
export const passwordResetConfirmSchema = z
  .object({
    ticket: z.string().min(1).max(1024),
    password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
    confirmPassword: z.string().min(1).max(PASSWORD_MAX_LENGTH),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
