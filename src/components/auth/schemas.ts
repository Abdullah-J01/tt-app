import { z } from "zod";
import type { Translator } from "@/i18n/types";

/**
 * Auth schemas are built per-render from a translator (bound to the `auth`
 * namespace) so validation messages are localized. The forms memoize the schema
 * on `t`. Value types are inferred from the factory return so callers stay typed.
 */

/** Shared email rule — distinguishes an empty field from a malformed address. */
const emailRule = (t: Translator) =>
  z.string().min(1, t("emailRequired")).pipe(z.email(t("emailInvalid")));

export const makeLoginSchema = (t: Translator) =>
  z.object({
    email: emailRule(t),
    password: z.string().min(1, t("passwordRequired")),
  });
export type LoginValues = z.infer<ReturnType<typeof makeLoginSchema>>;

export const makeSignupSchema = (t: Translator) =>
  z.object({
    name: z.string().min(1, t("nameRequired")),
    email: emailRule(t),
    password: z.string().min(8, t("passwordMin")),
  });
export type SignupValues = z.infer<ReturnType<typeof makeSignupSchema>>;

export const makeForgotPasswordSchema = (t: Translator) =>
  z.object({
    email: emailRule(t),
  });
export type ForgotPasswordValues = z.infer<ReturnType<typeof makeForgotPasswordSchema>>;
