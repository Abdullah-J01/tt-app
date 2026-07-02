import Link from "next/link";
import { signIn } from "next-auth/react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleIcon } from "./GoogleIcon";
import { PasswordField } from "./PasswordField";
import { OrDivider } from "./OrDivider";

/** Log-in face of the auth flip card (UI brief §6.2). `onSwitch` flips to sign-up. */
export function LoginFace({ onSwitch }: { onSwitch: () => void }) {
  // Desktop lands on the home page; mobile goes straight to the app feed.
  const landingUrl = () =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches ? "/" : "/feed";

  return (
    <div>
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
        <p className="mt-1.5 text-muted">Pick up your streak where you left off.</p>
      </div>

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const email = (form.querySelector("#login-email") as HTMLInputElement | null)?.value ?? "";
          const password =
            (form.querySelector("#login-password") as HTMLInputElement | null)?.value ?? "";
          // Demo: creates a real session via the credentials stub, then redirects.
          signIn("credentials", { email, password, callbackUrl: landingUrl() });
        }}
      >
        <Input
          id="login-email"
          type="email"
          label="Email"
          placeholder="you@email.com"
          leadingIcon={<Mail />}
          autoComplete="email"
        />
        <PasswordField id="login-password" autoComplete="current-password" />
        <div className="-mt-1 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-violet hover:text-violet-dark"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" block size="lg">
          Continue
        </Button>
      </form>

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

      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold text-violet hover:text-violet-dark"
        >
          Create account
        </button>
      </p>
    </div>
  );
}
