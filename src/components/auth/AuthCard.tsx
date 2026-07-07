"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LoginFace } from "./LoginFace";
import { SignupFace } from "./SignupFace";

type Mode = "login" | "signup";

/**
 * The one reusable auth card — a 3D flip between log-in and sign-up. Used both on
 * the /login page and inside the auth modal, so the design stays identical
 * wherever it opens. Each face carries its own header (logo left, close ✕ right).
 * Both faces are always mounted so switching flips rather than navigates.
 */
export function AuthCard({
  initialMode,
  syncUrl = true,
  onClose,
}: {
  initialMode: Mode;
  /** Keep the URL in sync (/login ↔ /signup) — true on the page, false in the modal. */
  syncUrl?: boolean;
  /** Close handler for the ✕ — the modal closes; the page falls back to home. */
  onClose?: () => void;
}) {
  const router = useRouter();
  const close = onClose ?? (() => router.push("/"));
  const [mode, setMode] = useState<Mode>(initialMode);
  // Enable the transition only after mount so a deep-linked /signup doesn't spin in.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const switchTo = (next: Mode) => {
    setMode(next);
    if (!syncUrl) return;
    // Preserve Next's router state (don't pass null) so back navigation keeps working.
    window.history.replaceState(window.history.state, "", next === "signup" ? "/signup" : "/login");
  };

  const isSignup = mode === "signup";

  return (
    <div className="mx-auto w-full max-w-[420px] [perspective:1200px]">
      <div
        className={cn(
          "grid items-center [transform-style:preserve-3d]",
          ready && "transition-transform duration-500",
          isSignup && "[transform:rotateY(180deg)]",
        )}
      >
        <div
          className="[backface-visibility:hidden] [grid-area:1/1]"
          inert={isSignup}
          aria-hidden={isSignup}
        >
          <LoginFace onSwitch={() => switchTo("signup")} onClose={close} />
        </div>
        <div
          className="[transform:rotateY(180deg)] [backface-visibility:hidden] [grid-area:1/1]"
          inert={!isSignup}
          aria-hidden={!isSignup}
        >
          <SignupFace onSwitch={() => switchTo("login")} onClose={close} />
        </div>
      </div>
    </div>
  );
}
