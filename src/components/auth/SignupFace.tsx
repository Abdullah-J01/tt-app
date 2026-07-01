import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleIcon } from "./GoogleIcon";
import { PasswordField } from "./PasswordField";
import { OrDivider } from "./OrDivider";

/** Sign-up face of the auth flip card (UI brief §6.2). `onSwitch` flips to log-in. */
export function SignupFace({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();

  return (
    <div>
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Create your account</h1>
        <p className="mt-1.5 text-muted">Start your daily learning habit in minutes.</p>
      </div>

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          // TODO(team): create the account via TT/NextAuth. Dummy: continue to onboarding.
          router.push("/onboarding");
        }}
      >
        <Input
          id="signup-name"
          type="text"
          label="Name"
          placeholder="Your name"
          leadingIcon={<User />}
          autoComplete="name"
        />
        <Input
          id="signup-email"
          type="email"
          label="Email"
          placeholder="you@email.com"
          leadingIcon={<Mail />}
          autoComplete="email"
        />
        <PasswordField id="signup-password" autoComplete="new-password" />
        <Button type="submit" block size="lg">
          Create account
        </Button>
      </form>

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

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold text-violet hover:text-violet-dark"
        >
          Log in
        </button>
      </p>
    </div>
  );
}
