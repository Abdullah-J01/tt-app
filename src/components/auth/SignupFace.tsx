"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "@/i18n/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
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
    setError,
    formState: { errors, isSubmitting },
  } = form;
  const [formError, setFormError] = useState<string | null>(null);

  /**
   * Two steps: create the account, then sign in with the same credentials.
   * NextAuth has no registration concept — the credentials provider only
   * verifies existing users — so sign-up goes through our own endpoint first.
   */
  const onSubmit = async ({ name, email, password }: SignupValues) => {
    setFormError(null);

    let response: Response;
    try {
      response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
    } catch {
      setFormError(tv("genericError"));
      return;
    }

    if (!response.ok) {
      const code = await response
        .json()
        .then((b: { error?: string }) => b.error)
        .catch(() => undefined);

      if (code === "email_taken") {
        // Attach to the field that caused it so the message sits where the user
        // has to act, and focus follows.
        setError("email", { message: tv("emailTaken") }, { shouldFocus: true });
        return;
      }
      // invalid_input means the client and server schemas disagree — a bug, not
      // something the user can fix by editing the field.
      setFormError(tv("signupFailed"));
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false }).catch(
      () => null,
    );
    if (!result || result.error) {
      // The account exists but auto-login failed; sending them to log in
      // manually beats a dead end.
      setFormError(tv("genericError"));
      return;
    }

    window.location.assign("/onboarding");
  };

  return (
    <div className={GLASS_CARD}>
      <AuthHeader onClose={onClose} />
      <div className="mb-5 text-center">
        <h1 className="font-display text-ink text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="text-muted mt-1 text-[13px]">{t("subtitle")}</p>
      </div>

      <Form form={form} onSubmit={onSubmit} className="flex flex-col gap-3">
        <FormError>{formError}</FormError>
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
        <Button type="submit" block size="lg" loading={isSubmitting}>
          {isSubmitting ? tv("creatingAccount") : t("submit")}
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
