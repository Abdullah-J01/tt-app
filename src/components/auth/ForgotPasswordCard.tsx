"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/layout/Logo";

/** Back-to-login link, shared by both states. */
function BackToLogin() {
  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet hover:text-violet-dark"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Back to log in
    </Link>
  );
}

/** Password reset request (UI brief §6.2). Enter email → dummy confirmation. */
export function ForgotPasswordCard() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-lavender-soft px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>

        {sent ? (
          <div className="mt-6 flex flex-col items-center gap-5 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-tint text-green-dark">
              <MailCheck className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Check your email</h1>
              <p className="mt-1.5 text-muted">
                If an account exists for{" "}
                <span className="font-semibold text-ink">{email}</span>, we&apos;ve sent a link to
                reset your password.
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
              <h1 className="font-display text-2xl font-bold text-ink">Reset your password</h1>
              <p className="mt-1.5 text-muted">
                Enter your email and we&apos;ll send you a link with instructions to reset your
                password.
              </p>
            </div>

            <form
              className="mt-6 flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                // TODO(team): trigger the reset email via TT/NextAuth. Dummy: show confirmation.
                if (email.trim()) setSent(true);
              }}
            >
              <Input
                id="reset-email"
                type="email"
                label="Email address"
                placeholder="you@email.com"
                leadingIcon={<Mail />}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" block size="lg">
                Request a new password
              </Button>
            </form>

            <div className="mt-6 text-center">
              <BackToLogin />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
