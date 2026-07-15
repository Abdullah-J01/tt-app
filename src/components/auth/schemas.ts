import { z } from "zod";
import type { Translator } from "@/i18n/types";
import { NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/authRules";

/**
 * Auth schemas are built per-render from a translator (bound to the `auth`
 * namespace) so validation messages are localized. The forms memoize the schema
 * on `t`. Value types are inferred from the factory return so callers stay typed.
 *
 * These give immediate, localized feedback; they are not a security boundary —
 * anyone can post straight to the API. The rules are re-enforced server-side from
 * the same constants (see @/lib/authRules), which is what actually gates a signup.
 */

/** Shared email rule — distinguishes an empty field from a malformed address. */
const emailRule = (t: Translator) =>
  z.string().min(1, t("emailRequired")).pipe(z.email(t("emailInvalid")));

export const makeLoginSchema = (t: Translator) =>
  z.object({
    email: emailRule(t),
    // Presence only — never the signup policy, or a rule change would lock out
    // existing accounts at the login form.
    password: z.string().min(1, t("passwordRequired")),
  });
export type LoginValues = z.infer<ReturnType<typeof makeLoginSchema>>;

export const makeSignupSchema = (t: Translator) =>
  z.object({
    name: z.string().min(1, t("nameRequired")).max(NAME_MAX_LENGTH, t("nameRequired")),
    email: emailRule(t),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, t("passwordMin"))
      .max(PASSWORD_MAX_LENGTH, t("passwordMax")),
  });
export type SignupValues = z.infer<ReturnType<typeof makeSignupSchema>>;

export const makeForgotPasswordSchema = (t: Translator) =>
  z.object({
    email: emailRule(t),
  });
export type ForgotPasswordValues = z.infer<ReturnType<typeof makeForgotPasswordSchema>>;
