"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Form, useZodForm } from "@/components/ui/Form";
import { GoogleIcon } from "./GoogleIcon";
import { PasswordField } from "./PasswordField";
import { OrDivider } from "./OrDivider";
import { GLASS_CARD, GLASS_FIELD, GLASS_INPUT, GLASS_LABEL } from "./authStyles";
import { loginSchema, type LoginValues } from "./schemas";

/** Log-in face of the auth flip card (UI brief §6.2). `onSwitch` flips to sign-up. */
export function LoginFace({ onSwitch }: { onSwitch: () => void }) {
  // Honors ?callbackUrl= when a guard bounced the user here (e.g. /admin).
  // Otherwise routes through /post-login, which checks the session role —
  // admins land on the admin dashboard, everyone else on the device default
  // (desktop: home page, mobile: feed).
  // Read via window (not useSearchParams) to keep /login statically prerendered.
  const landingUrl = () => {
    if (typeof window === "undefined") return "/post-login";
    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    // Internal paths only — never redirect to another origin ("//" is protocol-relative).
    if (callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")) return callbackUrl;
    const fallback = window.matchMedia("(min-width: 768px)").matches ? "/" : "/feed";
    return `/post-login?to=${encodeURIComponent(fallback)}`;
  };

  const form = useZodForm(loginSchema);
  const {
    register,
    formState: { errors },
  } = form;

  // Demo: creates a real session via the credentials stub, then redirects.
  const onSubmit = ({ email, password }: LoginValues) =>
    signIn("credentials", { email, password, callbackUrl: landingUrl() });

  return (
    <div className={GLASS_CARD}>
      <div className="mb-5 text-center">
        <h1 className="font-display text-ink text-xl font-bold sm:text-2xl">Welcome back</h1>
        <p className="text-muted mt-1 text-[13px]">Pick up your streak where you left off.</p>
      </div>

      <Form form={form} onSubmit={onSubmit} className="flex flex-col gap-3">
        <Input
          id="login-email"
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
        <PasswordField
          id="login-password"
          label="Password"
          labelClassName={GLASS_LABEL}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          containerClassName={GLASS_FIELD}
          className={GLASS_INPUT}
          {...register("password")}
        />
        <div className="-mt-0.5 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-violet hover:text-violet-dark text-[13px] font-semibold"
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

      <p className="text-muted mt-5 text-center text-[13px]">
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
