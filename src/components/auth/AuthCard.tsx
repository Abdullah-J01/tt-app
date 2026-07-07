"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LoginFace } from "./LoginFace";
import { SignupFace } from "./SignupFace";

type Mode = "login" | "signup";

/**
 * Auth screen with a 3D card flip between log-in and sign-up. Both faces are
 * always mounted (stacked in one grid cell) so switching flips rather than
 * navigating. The URL is kept in sync cosmetically so each mode stays shareable.
 */
export function AuthCard({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  // Enable the transition only after mount so a deep-linked /signup doesn't spin in.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const switchTo = (next: Mode) => {
    setMode(next);
    // Preserve Next's router state (don't pass null) so back navigation keeps working.
    window.history.replaceState(window.history.state, "", next === "signup" ? "/signup" : "/login");
  };

  const isSignup = mode === "signup";

  return (
    <div className="mx-auto w-full max-w-[340px]">
      <div className="[perspective:1200px]">
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
            <LoginFace onSwitch={() => switchTo("signup")} />
          </div>
          <div
            className="[transform:rotateY(180deg)] [backface-visibility:hidden] [grid-area:1/1]"
            inert={!isSignup}
            aria-hidden={!isSignup}
          >
            <SignupFace onSwitch={() => switchTo("login")} />
          </div>
        </div>
      </div>
    </div>
  );
}
