"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IllustrationPlaceholder } from "@/components/ui/IllustrationPlaceholder";
import { Logo } from "@/components/layout/Logo";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { PasswordField } from "@/components/auth/PasswordField";

/** Sign up (UI brief §6.2). Creates an account, then continues to onboarding. */
export default function SignupPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-lavender-soft px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo />
          <IllustrationPlaceholder caption="3D spot art · welcome mascot" className="h-28 w-28" />
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Create your account</h1>
            <p className="mt-1.5 text-muted">Start your daily learning habit in minutes.</p>
          </div>
        </div>

        <form
          className="mt-7 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO(team): create the account via TT/NextAuth. Dummy: continue to onboarding.
            router.push("/onboarding");
          }}
        >
          <Input id="name" type="text" label="Name" placeholder="Your name" leadingIcon={<User />} autoComplete="name" />
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@email.com"
            leadingIcon={<Mail />}
            autoComplete="email"
          />
          <PasswordField id="password" autoComplete="new-password" />
          <Button type="submit" block size="lg">
            Create account
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
          onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
        >
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-violet">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
