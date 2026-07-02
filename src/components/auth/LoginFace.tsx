"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Form, useZodForm } from "@/components/ui/Form";
import { GoogleIcon } from "./GoogleIcon";
import { PasswordField } from "./PasswordField";
import { OrDivider } from "./OrDivider";
import { loginSchema, type LoginValues } from "./schemas";

/** Log-in face of the auth flip card (UI brief §6.2). `onSwitch` flips to sign-up. */
export function LoginFace({ onSwitch }: { onSwitch: () => void }) {
  // Desktop lands on the home page; mobile goes straight to the app feed.
  const landingUrl = () =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
      ? "/"
      : "/feed";

  const form = useZodForm(loginSchema);
  const {
    register,
    formState: { errors },
  } = form;

  // Demo: creates a real session via the credentials stub, then redirects.
  const onSubmit = ({ email, password }: LoginValues) =>
    signIn("credentials", { email, password, callbackUrl: landingUrl() });

  return (
    <div>
      <div className="text-center">
        <h1 className="font-display text-ink text-2xl font-bold">Welcome back</h1>
        <p className="text-muted mt-1.5">Pick up your streak where you left off.</p>
      </div>

      <Form form={form} onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          id="login-email"
          type="email"
          label="Email"
          placeholder="you@email.com"
          leadingIcon={<Mail />}
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          id="login-password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="-mt-1 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-violet hover:text-violet-dark text-sm font-semibold"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" block size="lg">
          Continue
        </Button>
      </Form>

      <OrDivider />

      <Button
        variant="secondary"
        block
        size="lg"
        leadingIcon={<GoogleIcon />}
        onClick={() => signIn("google", { callbackUrl: landingUrl() })}
      >
        Continue with Google
      </Button>

      <p className="text-muted mt-6 text-center text-sm">
        New here?{" "}
        <Button
          unstyled
          type="button"
          onClick={onSwitch}
          className="text-violet hover:text-violet-dark font-semibold"
        >
          Create account
        </Button>
      </p>
    </div>
  );
}
