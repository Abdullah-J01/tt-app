"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Form, useZodForm } from "@/components/ui/Form";
import { GoogleIcon } from "./GoogleIcon";
import { PasswordField } from "./PasswordField";
import { OrDivider } from "./OrDivider";
import { signupSchema } from "./schemas";

/** Sign-up face of the auth flip card (UI brief §6.2). `onSwitch` flips to log-in. */
export function SignupFace({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();

  const form = useZodForm(signupSchema);
  const {
    register,
    formState: { errors },
  } = form;

  // TODO(team): create the account via TT/NextAuth. Dummy: continue to onboarding.
  const onSubmit = () => router.push("/onboarding");

  return (
    <div>
      <div className="text-center">
        <h1 className="font-display text-ink text-2xl font-bold">Create your account</h1>
        <p className="text-muted mt-1.5">Start your daily learning habit in minutes.</p>
      </div>

      <Form form={form} onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          id="signup-name"
          type="text"
          label="Name"
          placeholder="Your name"
          leadingIcon={<User />}
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          id="signup-email"
          type="email"
          label="Email"
          placeholder="you@email.com"
          leadingIcon={<Mail />}
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          id="signup-password"
          autoComplete="new-password"
          error={errors.password?.message}
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

      <p className="text-muted mt-6 text-center text-sm">
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
