"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IllustrationPlaceholder } from "@/components/ui/IllustrationPlaceholder";
import { Logo } from "@/components/layout/Logo";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { PasswordField } from "@/components/auth/PasswordField";

/** Log in (UI brief §6.2). Email-first with Google as the prominent alternative. */
export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-lavender-soft px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo />
          <IllustrationPlaceholder caption="3D spot art · welcome mascot" className="h-28 w-28" />
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
            <p className="mt-1.5 text-muted">Pick up your streak where you left off.</p>
          </div>
        </div>

        <form
          className="mt-7 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO(team): signIn("credentials", { email, password, callbackUrl: "/feed" }).
            // Dummy: go straight to the feed.
            router.push("/feed");
          }}
        >
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@email.com"
            leadingIcon={<Mail />}
            autoComplete="email"
          />
          <PasswordField id="password" autoComplete="current-password" />
          <Button type="submit" block size="lg">
            Continue
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-hairline" /> or <span className="h-px flex-1 bg-hairline" />
        </div>

        <Button
          variant="secondary"
          block
          size="lg"
          leadingIcon={<GoogleIcon />}
          onClick={() => signIn("google", { callbackUrl: "/feed" })}
        >
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-violet">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
