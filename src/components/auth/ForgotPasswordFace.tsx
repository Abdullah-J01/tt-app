"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "@/i18n/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { Form, useZodForm } from "@/components/ui/Form";
import { AuthHeader } from "./AuthHeader";
import { GLASS_CARD, GLASS_FIELD, GLASS_INPUT, GLASS_LABEL } from "./authStyles";
import { makeForgotPasswordSchema, type ForgotPasswordValues } from "./schemas";
import { requestPasswordResetOtp, type RequestOtpError } from "./passwordResetApi";

/**
 * Password reset face of the auth flip card (UI brief §6.2). Enter email → the
 * server mails a one-time code → the card advances to OtpVerificationFace.
 *
 * The old "check your email" confirmation state that lived here is gone: the OTP
 * face is now what the user sees after a successful send, so that screen had
 * become unreachable. The email form itself is untouched.
 *
 * `onSwitch` flips back to log-in; `onSent` hands the address to the OTP step.
 */
export function ForgotPasswordFace({
  onSwitch,
  onSent,
  onClose,
}: {
  onSwitch: () => void;
  /** Called once a code is genuinely on its way to the user's inbox. */
  onSent: (email: string) => void;
  onClose: () => void;
}) {
  const t = useTranslations("components_auth_ForgotPasswordFace");
  const tv = useTranslations("auth");
  const locale = useLocale();

  const form = useZodForm(useMemo(() => makeForgotPasswordSchema(tv), [tv]));
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;
  const [formError, setFormError] = useState<string | null>(null);

  /**
   * `email_not_found` is surfaced plainly, which makes this step an account
   * enumeration oracle. That is a deliberate product decision and a departure
   * from the login form, which cannot distinguish an unknown address from a
   * wrong password — see the note in the request route handler.
   */
  const errorMessage = (error: RequestOtpError | "network", retryAfter?: number): string => {
    switch (error) {
      case "email_not_found":
        return tv("emailNotFound");
      case "cooldown":
        return tv("otpResendCooldown", { seconds: retryAfter ?? 60 });
      case "rate_limited":
        return tv("otpRateLimited");
      case "email_failed":
        return tv("emailDeliveryFailed");
      case "invalid_input":
        return tv("emailInvalid");
      case "network":
        return tv("networkError");
      default:
        return tv("genericError");
    }
  };

  const onSubmit = async ({ email }: ForgotPasswordValues) => {
    setFormError(null);

    const result = await requestPasswordResetOtp(email, locale);

    if (!result.ok) {
      setFormError(errorMessage(result.error, result.retryAfterSeconds));
      return;
    }

    onSent(email.trim().toLowerCase());
  };

  return (
    <div className={GLASS_CARD}>
      <AuthHeader onClose={onClose} />
      <div className="mb-5 text-center">
        <h1 className="font-display text-ink text-xl font-bold sm:text-2xl">{t("resetTitle")}</h1>
        <p className="text-muted mt-1 text-[13px]">{t("resetSubtitle")}</p>
      </div>

      <Form form={form} onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormError>{formError}</FormError>
        <Input
          id="reset-email"
          type="email"
          label={t("emailLabel")}
          labelClassName={GLASS_LABEL}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          error={errors.email?.message}
          containerClassName={GLASS_FIELD}
          className={GLASS_INPUT}
          {...register("email")}
        />
        <Button type="submit" block size="lg" loading={isSubmitting}>
          {isSubmitting ? t("sending") : t("requestNewPassword")}
        </Button>
      </Form>

      <p className="text-muted mt-5 text-center text-[13px]">
        {t("rememberPassword")}{" "}
        <Button
          unstyled
          type="button"
          onClick={onSwitch}
          className="text-violet hover:text-violet-dark font-semibold"
        >
          {t("login")}
        </Button>
      </p>
    </div>
  );
}
