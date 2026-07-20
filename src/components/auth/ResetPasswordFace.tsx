"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "@/i18n/client";
import { CheckCircle2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Form, useZodForm } from "@/components/ui/Form";
import { PASSWORD_MIN_LENGTH } from "@/lib/authRules";
import { AuthHeader } from "./AuthHeader";
import { PasswordField } from "./PasswordField";
import { GLASS_CARD, GLASS_FIELD, GLASS_INPUT, GLASS_LABEL } from "./authStyles";
import { makeResetPasswordSchema, type ResetPasswordValues } from "./schemas";
import { confirmPasswordReset, type ConfirmResetError } from "./passwordResetApi";

export function ResetPasswordFace({
  ticket,
  onDone,
  onExpired,
  onClose,
}: {
  ticket: string;

  onDone: () => void;

  onExpired: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("components_auth_ResetPasswordFace");
  const tv = useTranslations("auth");

  const form = useZodForm(useMemo(() => makeResetPasswordSchema(tv), [tv]));
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const errorMessage = (error: ConfirmResetError | "network"): string => {
    switch (error) {
      case "invalid_ticket":
        return tv("resetSessionExpired");
      case "password_mismatch":
        return tv("passwordsDoNotMatch");
      case "network":
        return tv("networkError");
      default:
        return tv("genericError");
    }
  };

  const onSubmit = async ({ password, confirmPassword }: ResetPasswordValues) => {
    setFormError(null);

    const result = await confirmPasswordReset({ ticket, password, confirmPassword });

    if (!result.ok) {
      setFormError(errorMessage(result.error));

      if (result.error === "invalid_ticket") {
        window.setTimeout(onExpired, 2000);
      }
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className={GLASS_CARD}>
        <AuthHeader onClose={onClose} />
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="bg-violet-tint text-violet grid h-14 w-14 place-items-center rounded-full">
            <CheckCircle2 className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-ink text-xl font-bold sm:text-2xl">
              {t("successTitle")}
            </h1>
            <p className="text-muted mt-1.5 text-[13px]">{t("successBody")}</p>
          </div>
          <Button block size="lg" onClick={onDone}>
            {t("backToLogin")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={GLASS_CARD}>
      <AuthHeader onClose={onClose} />

      <div className="mb-5 flex flex-col items-center gap-4 text-center">
        <span className="bg-violet-tint text-violet grid h-14 w-14 place-items-center rounded-full">
          <KeyRound className="h-7 w-7" aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-ink text-xl font-bold sm:text-2xl">{t("title")}</h1>
          <p className="text-muted mt-1.5 text-[13px]">{t("subtitle")}</p>
        </div>
      </div>

      <Form form={form} onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormError>{formError}</FormError>

        <PasswordField
          id="reset-new-password"
          label={t("newPasswordLabel")}
          labelClassName={GLASS_LABEL}
          placeholder={t("newPasswordPlaceholder")}
          autoComplete="new-password"
          hint={t("passwordHint", { min: PASSWORD_MIN_LENGTH })}
          error={errors.password?.message}
          containerClassName={GLASS_FIELD}
          className={GLASS_INPUT}
          {...register("password")}
        />

        <PasswordField
          id="reset-confirm-password"
          label={t("confirmPasswordLabel")}
          labelClassName={GLASS_LABEL}
          placeholder={t("confirmPasswordPlaceholder")}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          containerClassName={GLASS_FIELD}
          className={GLASS_INPUT}
          {...register("confirmPassword")}
        />

        <Button type="submit" block size="lg" loading={isSubmitting}>
          {isSubmitting ? t("saving") : t("save")}
        </Button>
      </Form>
    </div>
  );
}
