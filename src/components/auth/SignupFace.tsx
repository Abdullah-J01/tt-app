"use client";

import { useMemo } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "@/i18n/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Form, useZodForm } from "@/components/ui/Form";
import { GoogleIcon } from "./GoogleIcon";
import { PasswordField } from "./PasswordField";
import { OrDivider } from "./OrDivider";
import { AuthHeader } from "./AuthHeader";
import { GLASS_CARD, GLASS_FIELD, GLASS_INPUT, GLASS_LABEL } from "./authStyles";
import { makeSignupSchema, type SignupValues } from "./schemas";

/** Sign-up face of the auth flip card (UI brief §6.2). `onSwitch` flips to log-in. */
export function SignupFace({ onSwitch, onClose }: { onSwitch: () => void; onClose: () => void }) {
  const t = useTranslations("components_auth_SignupFace");
  const tv = useTranslations("auth");
  const form = useZodForm(useMemo(() => makeSignupSchema(tv), [tv]));
  const {
    register,
    formState: { errors },
  } = form;

  // Dev stub: create a real session via the credentials provider carrying the
  // entered name + email, so the profile shows the new account (not placeholder
  // data), then continue to onboarding.
  // TODO(team): swap this for TT's real sign-up endpoint.
  const onSubmit = ({ name, email, password }: SignupValues) =>
    signIn("credentials", { name, email, password, callbackUrl: "/onboarding" });

  return (
    <div className={GLASS_CARD}>
      <AuthHeader onClose={onClose} />
      <div className="mb-5 text-center">
        <h1 className="font-display text-ink text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="text-muted mt-1 text-[13px]">{t("subtitle")}</p>
      </div>

      <Form form={form} onSubmit={onSubmit} className="flex flex-col gap-3">
        <Input
          id="signup-name"
          type="text"
          label={t("nameLabel")}
          labelClassName={GLASS_LABEL}
          placeholder={t("namePlaceholder")}
          autoComplete="name"
          error={errors.name?.message}
          containerClassName={GLASS_FIELD}
          className={GLASS_INPUT}
          {...register("name")}
        />
        <Input
          id="signup-email"
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
        <PasswordField
          id="signup-password"
          label={t("passwordLabel")}
          labelClassName={GLASS_LABEL}
          placeholder={t("passwordPlaceholder")}
          autoComplete="new-password"
          error={errors.password?.message}
          containerClassName={GLASS_FIELD}
          className={GLASS_INPUT}
          {...register("password")}
        />
        <Button type="submit" block size="lg">
          {t("submit")}
        </Button>
      </Form>

      <OrDivider />

      <Button
        variant="secondary"
        block
        size="lg"
        leadingIcon={<GoogleIcon />}
        onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
      >
        {t("continueGoogle")}
      </Button>

      <p className="text-muted mt-5 text-center text-[13px]">
        {t("haveAccount")}{" "}
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
