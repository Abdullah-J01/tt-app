"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { IllustrationPlaceholder } from "@/components/ui/IllustrationPlaceholder";
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
    window.history.replaceState(null, "", next === "signup" ? "/signup" : "/login");
  };

  const isSignup = mode === "signup";

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-lavender-soft px-5 py-10">
      <div className="w-full max-w-sm">
        {/* Static branding above the flipping card */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo animated />
          <IllustrationPlaceholder caption="3D spot art · welcome mascot" className="h-28 w-28" />
        </div>

        <div className="mt-6 [perspective:1200px]">
          <div
            className={cn(
              "grid [transform-style:preserve-3d]",
              ready && "transition-transform duration-500",
              isSignup && "[transform:rotateY(180deg)]",
            )}
          >
            <div
              className="[grid-area:1/1] [backface-visibility:hidden]"
              inert={isSignup}
              aria-hidden={isSignup}
            >
              <LoginFace onSwitch={() => switchTo("signup")} />
            </div>
            <div
              className="[grid-area:1/1] [backface-visibility:hidden] [transform:rotateY(180deg)]"
              inert={!isSignup}
              aria-hidden={!isSignup}
            >
              <SignupFace onSwitch={() => switchTo("login")} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
