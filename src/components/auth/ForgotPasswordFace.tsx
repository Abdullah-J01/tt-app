"use client";

import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Form, useZodForm } from "@/components/ui/Form";
import { AuthHeader } from "./AuthHeader";
import { GLASS_CARD, GLASS_FIELD, GLASS_INPUT, GLASS_LABEL } from "./authStyles";
import { forgotPasswordSchema, type ForgotPasswordValues } from "./schemas";

/** Back-to-login flip trigger, shared by both states. */
function BackToLogin({ onSwitch }: { onSwitch: () => void }) {
  return (
    <Button
      unstyled
      type="button"
      onClick={onSwitch}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Back to log in
    </Button>
  );
}

/**
 * Password reset face of the auth flip card (UI brief §6.2). Enter email →
 * dummy confirmation. `onSwitch` flips back to log-in.
 */
export function ForgotPasswordFace({
  onSwitch,
  onClose,
}: {
  onSwitch: () => void;
  onClose: () => void;
}) {
  const [sentEmail, setSentEmail] = useState("");
  const [sent, setSent] = useState(false);

  const form = useZodForm(forgotPasswordSchema);
  const {
    register,
    formState: { errors },
  } = form;

  // TODO(team): trigger the reset email via TT/NextAuth. Dummy: show confirmation.
  const onSubmit = ({ email }: ForgotPasswordValues) => {
    setSentEmail(email);
    setSent(true);
  };

  return (
    <div className={GLASS_CARD}>
      <AuthHeader onClose={onClose} />
      {sent ? (
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="bg-violet-tint text-violet grid h-14 w-14 place-items-center rounded-full">
            <MailCheck className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-ink text-xl font-bold sm:text-2xl">
              Check your email
            </h1>
            <p className="text-muted mt-1.5 text-[13px]">
              If an account exists for <span className="text-ink font-semibold">{sentEmail}</span>
              , we&apos;ve sent a link to reset your password.
            </p>
          </div>
          <Button variant="secondary" block size="lg" onClick={() => setSent(false)}>
            Use a different email
          </Button>
          <BackToLogin onSwitch={onSwitch} />
        </div>
      ) : (
        <>
          <div className="mb-5 text-center">
            <h1 className="font-display text-ink text-xl font-bold sm:text-2xl">
              Reset your password
            </h1>
            <p className="text-muted mt-1 text-[13px]">
              Enter your email and we&apos;ll send you a link with instructions to reset your
              password.
            </p>
          </div>

          <Form form={form} onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              id="reset-email"
              type="email"
              label="Email"
              labelClassName={GLASS_LABEL}
              placeholder="Enter your email"
              autoComplete="email"
              error={errors.email?.message}
              containerClassName={GLASS_FIELD}
              className={GLASS_INPUT}
              {...register("email")}
            />
            <Button type="submit" block size="lg">
              Request a new password
            </Button>
          </Form>

          <p className="text-muted mt-5 text-center text-[13px]">
            Remember your password?{" "}
            <Button
              unstyled
              type="button"
              onClick={onSwitch}
              className="text-violet hover:text-violet-dark font-semibold"
            >
              Log in
            </Button>
          </p>
        </>
      )}
    </div>
  );
}
