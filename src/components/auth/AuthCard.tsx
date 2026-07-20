"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { LoginFace } from "./LoginFace";
import { SignupFace } from "./SignupFace";
import { ForgotPasswordFace } from "./ForgotPasswordFace";
import { OtpVerificationFace } from "./OtpVerificationFace";
import { ResetPasswordFace } from "./ResetPasswordFace";

type Mode = "login" | "signup" | "forgot" | "otp" | "reset";

/**
 * The reset steps keep the /forgot-password URL: they hold their state (address,
 * signed ticket) in memory only, so a deep link or refresh into "otp" would land
 * on a face with nothing to verify. Staying on /forgot-password means a refresh
 * restarts the flow at the step that can actually begin it.
 */
const MODE_URLS: Record<Mode, string> = {
  login: "/login",
  signup: "/signup",
  forgot: "/forgot-password",
  otp: "/forgot-password",
  reset: "/forgot-password",
};

/**
 * The one reusable auth card — a 3D flip with log-in on the front and sign-up or
 * the password-reset flow on the back. Used both on the auth pages and inside
 * the auth modal, so the design stays identical wherever it opens. Each face
 * carries its own header (logo left, close ✕ right). Faces stay mounted so
 * switching flips rather than navigates.
 *
 * Password reset is a three-step sequence on the back face — email → code →
 * new password. The card owns the state that moves between them, since the
 * faces themselves unmount as the sequence advances.
 */
export function AuthCard({
  initialMode,
  syncUrl = true,
  onClose,
}: {
  initialMode: Exclude<Mode, "otp" | "reset">;
  /** Keep the URL in sync (/login ↔ /signup ↔ /forgot-password) — true on the page, false in the modal. */
  syncUrl?: boolean;
  /** Close handler for the ✕ — the modal closes; the page falls back to home. */
  onClose?: () => void;
}) {
  const router = useRouter();
  const locale = useLocale();
  const close = onClose ?? (() => router.push("/"));
  const [mode, setMode] = useState<Mode>(initialMode);
  // What the back face shows. Deliberately not cleared when flipping home, so
  // the content doesn't swap mid-turn while the card is still rotating. It does
  // change in place as the reset flow advances (forgot → otp → reset), which is
  // correct — those steps replace each other without a flip.
  const [backMode, setBackMode] = useState<Exclude<Mode, "login">>(
    initialMode === "login" ? "signup" : initialMode,
  );
  // Enable the transition only after mount so a deep-linked /signup doesn't spin in.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  // Carried across the reset steps. The ticket is a short-lived signed proof
  // that the OTP was verified; it is never persisted, so closing the card
  // abandons the flow — which is the behaviour we want.
  const [resetEmail, setResetEmail] = useState("");
  const [resetTicket, setResetTicket] = useState("");

  const switchTo = (next: Mode) => {
    setMode(next);
    if (next !== "login") setBackMode(next);
    if (!syncUrl) return;
    // Preserve Next's router state (don't pass null) so back navigation keeps working.
    window.history.replaceState(window.history.state, "", MODE_URLS[next]);
  };

  /** Drops any half-finished reset state on the way back to log in. */
  const returnToLogin = () => {
    setResetEmail("");
    setResetTicket("");
    switchTo("login");
  };

  const isFlipped = mode !== "login";

  const backFace = () => {
    switch (backMode) {
      case "forgot":
        return (
          <ForgotPasswordFace
            onSwitch={returnToLogin}
            onSent={(email) => {
              setResetEmail(email);
              switchTo("otp");
            }}
            onClose={close}
          />
        );
      case "otp":
        return (
          <OtpVerificationFace
            email={resetEmail}
            locale={locale}
            onVerified={(ticket) => {
              setResetTicket(ticket);
              switchTo("reset");
            }}
            onBack={() => switchTo("forgot")}
            onSwitchToLogin={returnToLogin}
            onClose={close}
          />
        );
      case "reset":
        return (
          <ResetPasswordFace
            ticket={resetTicket}
            onDone={returnToLogin}
            // Ticket expired or already spent — restart from the address step.
            onExpired={() => {
              setResetTicket("");
              switchTo("forgot");
            }}
            onClose={close}
          />
        );
      default:
        return <SignupFace onSwitch={() => switchTo("login")} onClose={close} />;
    }
  };

  return (
    <div className="mx-auto w-full max-w-[420px] [perspective:1200px]">
      <div
        className={cn(
          "grid items-center [transform-style:preserve-3d]",
          ready && "transition-transform duration-500",
          isFlipped && "[transform:rotateY(180deg)]",
        )}
      >
        <div
          className="[backface-visibility:hidden] [grid-area:1/1]"
          inert={isFlipped}
          aria-hidden={isFlipped}
        >
          <LoginFace
            onSwitch={() => switchTo("signup")}
            onForgot={() => switchTo("forgot")}
            onClose={close}
          />
        </div>
        <div
          className="[transform:rotateY(180deg)] [backface-visibility:hidden] [grid-area:1/1]"
          inert={!isFlipped}
          aria-hidden={!isFlipped}
        >
          {backFace()}
        </div>
      </div>
    </div>
  );
}
