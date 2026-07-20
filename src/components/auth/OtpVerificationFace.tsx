"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "@/i18n/client";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Form, useZodForm } from "@/components/ui/Form";
import { FieldError } from "@/components/ui/FieldError";
import { OTP_LENGTH, OTP_TTL_MINUTES, RESEND_COOLDOWN_SECONDS } from "@/lib/authRules";
import { AuthHeader } from "./AuthHeader";
import { GLASS_CARD } from "./authStyles";
import { OtpInput } from "./OtpInput";
import { useCountdown } from "./useCountdown";
import { makeOtpSchema, type OtpValues } from "./schemas";
import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  type RequestOtpError,
  type VerifyOtpError,
} from "./passwordResetApi";

/**
 * Code-entry face of the auth flip card — step 2 of password reset, between
 * ForgotPasswordFace (which mailed the code) and ResetPasswordFace (which sets
 * the new password).
 *
 * Layout, spacing and tokens are lifted from ForgotPasswordFace deliberately, so
 * the three reset steps read as one flow: same GLASS_CARD, same AuthHeader, same
 * centered heading block, same violet-tint status medallion, same back link.
 */
export function OtpVerificationFace({
  email,
  locale,
  onVerified,
  onBack,
  onSwitchToLogin,
  onClose,
}: {
  email: string;
  locale?: string;
  /** Hands the signed reset ticket up so the next face can spend it. */
  onVerified: (ticket: string) => void;
  /** Back to the email step, so a mistyped address can be corrected. */
  onBack: () => void;
  onSwitchToLogin: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("components_auth_OtpVerificationFace");
  const tv = useTranslations("auth");

  const form = useZodForm(useMemo(() => makeOtpSchema(tv), [tv]));
  const {
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;
  const code = watch("code") ?? "";

  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  /** Set when the code is dead (expired or burned) — only a resend can recover. */
  const [needsNewCode, setNeedsNewCode] = useState(false);

  const { secondsLeft, start } = useCountdown();

  // The code was mailed just before this face mounted, so the cooldown is
  // already running server-side. Mirror it immediately rather than letting the
  // button look available for a second.
  useEffect(() => start(RESEND_COOLDOWN_SECONDS), [start]);

  const verifyErrorMessage = (error: VerifyOtpError | "network", attemptsLeft?: number): string => {
    switch (error) {
      case "invalid_code":
        return attemptsLeft !== undefined
          ? tv("otpInvalidWithAttempts", { count: attemptsLeft })
          : tv("otpInvalid");
      case "expired":
        return tv("otpExpired");
      case "too_many_attempts":
        return tv("otpTooManyAttempts");
      case "rate_limited":
        return tv("otpRateLimited");
      case "network":
        return tv("networkError");
      default:
        return tv("genericError");
    }
  };

  const resendErrorMessage = (error: RequestOtpError | "network", retryAfter?: number): string => {
    switch (error) {
      case "cooldown":
        return tv("otpResendCooldown", { seconds: retryAfter ?? RESEND_COOLDOWN_SECONDS });
      case "rate_limited":
        return tv("otpRateLimited");
      case "email_failed":
        return tv("emailDeliveryFailed");
      case "network":
        return tv("networkError");
      default:
        return tv("genericError");
    }
  };

  const onSubmit = async ({ code: submitted }: OtpValues) => {
    setFormError(null);
    setNotice(null);

    const result = await verifyPasswordResetOtp(email, submitted);

    if (!result.ok) {
      setFormError(verifyErrorMessage(result.error, result.attemptsLeft));
      // A dead code can't be retyped out of — swap the primary action for a resend.
      setNeedsNewCode(result.error === "expired" || result.error === "too_many_attempts");
      setValue("code", "");
      return;
    }

    onVerified(result.ticket);
  };

  const onResend = async () => {
    if (secondsLeft > 0 || resending) return;
    setResending(true);
    setFormError(null);
    setNotice(null);

    const result = await requestPasswordResetOtp(email, locale);
    setResending(false);

    if (!result.ok) {
      setFormError(resendErrorMessage(result.error, result.retryAfterSeconds));
      // Honour a server-side cooldown we didn't know about (e.g. a second tab).
      if (result.error === "cooldown" && result.retryAfterSeconds) start(result.retryAfterSeconds);
      return;
    }

    setValue("code", "");
    setNeedsNewCode(false);
    setNotice(t("resent"));
    start(result.resendAfterSeconds ?? RESEND_COOLDOWN_SECONDS);
  };

  return (
    <div className={GLASS_CARD}>
      <AuthHeader onClose={onClose} />

      <div className="mb-5 flex flex-col items-center gap-4 text-center">
        <span className="bg-violet-tint text-violet grid h-14 w-14 place-items-center rounded-full">
          <ShieldCheck className="h-7 w-7" aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-ink text-xl font-bold sm:text-2xl">{t("title")}</h1>
          <p className="text-muted mt-1.5 text-[13px]">
            {t.rich("subtitle", {
              email: () => <span className="text-ink font-semibold">{email}</span>,
            })}
          </p>
        </div>
      </div>

      <Form form={form} onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormError>{formError}</FormError>
        {notice && (
          <p
            role="status"
            className="bg-violet-tint text-violet rounded-xl px-3 py-2 text-center text-[13px] font-medium"
          >
            {notice}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <OtpInput
            value={code}
            onChange={(next) => {
              setValue("code", next, { shouldValidate: next.length === OTP_LENGTH });
              if (formError) setFormError(null);
            }}
            // Auto-submit on the last digit; the form's own validation still runs.
            onComplete={() => {
              if (!needsNewCode) void form.handleSubmit(onSubmit)();
            }}
            disabled={isSubmitting || resending}
            invalid={Boolean(errors.code) || Boolean(formError)}
            ariaLabel={t("codeLabel")}
          />
          {errors.code?.message && <FieldError id="otp-error">{errors.code.message}</FieldError>}
          <p className="text-muted mt-0.5 text-center text-xs">
            {t("expiryHint", { minutes: OTP_TTL_MINUTES })}
          </p>
        </div>

        <Button
          type="submit"
          block
          size="lg"
          loading={isSubmitting}
          disabled={needsNewCode || code.length !== OTP_LENGTH}
        >
          {isSubmitting ? t("verifying") : t("verify")}
        </Button>
      </Form>

      <div className="mt-5 flex flex-col items-center gap-3">
        <p className="text-muted text-center text-[13px]">
          {t("noCode")}{" "}
          <Button
            unstyled
            type="button"
            onClick={onResend}
            disabled={secondsLeft > 0 || resending}
            className="text-violet hover:text-violet-dark disabled:text-muted disabled:hover:text-muted font-semibold disabled:cursor-not-allowed"
          >
            {resending
              ? t("resending")
              : secondsLeft > 0
                ? t("resendIn", { seconds: secondsLeft })
                : t("resend")}
          </Button>
        </p>

        <div className="flex items-center gap-4">
          <Button
            unstyled
            type="button"
            onClick={onBack}
            className="text-muted hover:text-ink inline-flex items-center gap-1.5 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("changeEmail")}
          </Button>
          <Button
            unstyled
            type="button"
            onClick={onSwitchToLogin}
            className="text-violet hover:text-violet-dark text-sm font-semibold"
          >
            {t("backToLogin")}
          </Button>
        </div>
      </div>
    </div>
  );
}
