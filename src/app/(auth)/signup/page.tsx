"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

/** Sign up (UI brief §6.2). */
export default function SignupPage() {
  return (
    <div className="grid min-h-[100svh] place-items-center bg-lavender px-4">
      <div className="w-full max-w-sm rounded-card border border-hairline bg-surface p-8 shadow-soft">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center text-xl font-bold">Create your account</h1>

        <Button
          className="mt-6 w-full"
          variant="secondary"
          onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
        >
          Continue with Google
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-hairline" /> or <span className="h-px flex-1 bg-hairline" />
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO(team): create account, then route to /onboarding
          }}
        >
          <input
            type="text"
            placeholder="Name"
            className="h-11 w-full rounded-xl border border-hairline px-4 text-sm outline-none focus:border-violet"
          />
          <input
            type="email"
            placeholder="Email"
            className="h-11 w-full rounded-xl border border-hairline px-4 text-sm outline-none focus:border-violet"
          />
          <input
            type="password"
            placeholder="Password"
            className="h-11 w-full rounded-xl border border-hairline px-4 text-sm outline-none focus:border-violet"
          />
          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-violet">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
