"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Form, useZodForm } from "@/components/ui/Form";
import { GoogleIcon } from "./GoogleIcon";
import { PasswordField } from "./PasswordField";
import { OrDivider } from "./OrDivider";
import { AuthHeader } from "./AuthHeader";
import { GLASS_CARD, GLASS_FIELD, GLASS_INPUT, GLASS_LABEL } from "./authStyles";
import { signupSchema, type SignupValues } from "./schemas";

/** Sign-up face of the auth flip card (UI brief §6.2). `onSwitch` flips to log-in. */
export function SignupFace({ onSwitch, onClose }: { onSwitch: () => void; onClose: () => void }) {
  const form = useZodForm(signupSchema);
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
        <h1 className="font-display text-ink text-xl font-bold sm:text-2xl">Create your account</h1>
        <p className="text-muted mt-1 text-[13px]">Start your daily learning habit in minutes.</p>
      </div>

      <Form form={form} onSubmit={onSubmit} className="flex flex-col gap-3">
        <Input
          id="signup-name"
          type="text"
          label="Name"
          labelClassName={GLASS_LABEL}
          placeholder="Your name"
          autoComplete="name"
          error={errors.name?.message}
          containerClassName={GLASS_FIELD}
          className={GLASS_INPUT}
          {...register("name")}
        />
        <Input
          id="signup-email"
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
          id="signup-password"
          label="Password"
          labelClassName={GLASS_LABEL}
          placeholder="Create a password"
          autoComplete="new-password"
          error={errors.password?.message}
          containerClassName={GLASS_FIELD}
          className={GLASS_INPUT}
          {...register("password")}
        />
        <Button type="submit" block size="lg">
          Create account
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
        Continue with Google
      </Button>

      <p className="text-muted mt-5 text-center text-[13px]">
        Already have an account?{" "}
        <Button
          unstyled
          type="button"
          onClick={onSwitch}
          className="text-violet hover:text-violet-dark font-semibold"
        >
          Log in
        </Button>
      </p>
    </div>
  );
}
