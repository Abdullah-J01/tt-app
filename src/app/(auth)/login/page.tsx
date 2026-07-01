"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

/** Log in (UI brief §6.2). Google prominent; email/password visual only. */
export default function LoginPage() {
  return (
    <div className="grid min-h-[100svh] place-items-center bg-lavender px-4">
      <div className="w-full max-w-sm rounded-card border border-hairline bg-surface p-8 shadow-soft">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center text-xl font-bold">Welcome back</h1>

        <Button
          className="mt-6 w-full"
          variant="secondary"
          onClick={() => signIn("google", { callbackUrl: "/feed" })}
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
            // TODO(team): signIn("credentials", ...)
          }}
        >
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
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/signup" className="font-medium text-violet">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
