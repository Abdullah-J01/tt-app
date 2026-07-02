"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Form, useZodForm } from "@/components/ui/Form";
import { Logo } from "@/components/layout/Logo";
import { forgotPasswordSchema, type ForgotPasswordValues } from "./schemas";

/** Back-to-login link, shared by both states. */
function BackToLogin() {
  return (
    <Link
      href="/login"
      className="text-violet hover:text-violet-dark inline-flex items-center gap-1.5 text-sm font-semibold"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Back to log in
    </Link>
  );
}

/** Password reset request (UI brief §6.2). Enter email → dummy confirmation. */
export function ForgotPasswordCard() {
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
    <main className="bg-lavender-soft flex min-h-[100svh] flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>

        {sent ? (
          <div className="mt-6 flex flex-col items-center gap-5 text-center">
            <span className="bg-green-tint text-green-dark flex h-14 w-14 items-center justify-center rounded-full">
              <MailCheck className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-ink text-2xl font-bold">Check your email</h1>
              <p className="text-muted mt-1.5">
                If an account exists for <span className="text-ink font-semibold">{sentEmail}</span>
                , we&apos;ve sent a link to reset your password.
              </p>
            </div>
            <Button variant="secondary" block size="lg" onClick={() => setSent(false)}>
              Use a different email
            </Button>
            <BackToLogin />
          </div>
        ) : (
          <>
            <div className="mt-6 text-center">
              <h1 className="font-display text-ink text-2xl font-bold">Reset your password</h1>
              <p className="text-muted mt-1.5">
                Enter your email and we&apos;ll send you a link with instructions to reset your
                password.
              </p>
            </div>

            <Form form={form} onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
              <Input
                id="reset-email"
                type="email"
                label="Email address"
                placeholder="you@email.com"
                leadingIcon={<Mail />}
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <Button type="submit" block size="lg">
                Request a new password
              </Button>
            </Form>

            <div className="mt-6 text-center">
              <BackToLogin />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
