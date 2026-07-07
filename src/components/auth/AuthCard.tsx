"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LoginFace } from "./LoginFace";
import { SignupFace } from "./SignupFace";
import { ForgotPasswordFace } from "./ForgotPasswordFace";

type Mode = "login" | "signup" | "forgot";

const MODE_URLS: Record<Mode, string> = {
  login: "/login",
  signup: "/signup",
  forgot: "/forgot-password",
};

/**
 * The one reusable auth card — a 3D flip with log-in on the front and either
 * sign-up or password-reset on the back. Used both on the auth pages and inside
 * the auth modal, so the design stays identical wherever it opens. Each face
 * carries its own header (logo left, close ✕ right). Faces stay mounted so
 * switching flips rather than navigates.
 */
export function AuthCard({
  initialMode,
  syncUrl = true,
  onClose,
}: {
  initialMode: Mode;
  /** Keep the URL in sync (/login ↔ /signup ↔ /forgot-password) — true on the page, false in the modal. */
  syncUrl?: boolean;
  /** Close handler for the ✕ — the modal closes; the page falls back to home. */
  onClose?: () => void;
}) {
  const router = useRouter();
  const close = onClose ?? (() => router.push("/"));
  const [mode, setMode] = useState<Mode>(initialMode);
  // What the back face shows. Sticky while flipping home so the content
  // doesn't swap mid-turn (forgot is only reachable from login, so the back
  // face never has to change while it's the visible one).
  const [backMode, setBackMode] = useState<Exclude<Mode, "login">>(
    initialMode === "login" ? "signup" : initialMode,
  );
  // Enable the transition only after mount so a deep-linked /signup doesn't spin in.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const switchTo = (next: Mode) => {
    setMode(next);
    if (next !== "login") setBackMode(next);
    if (!syncUrl) return;
    // Preserve Next's router state (don't pass null) so back navigation keeps working.
    window.history.replaceState(window.history.state, "", MODE_URLS[next]);
  };

  const isFlipped = mode !== "login";

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
          {backMode === "forgot" ? (
            <ForgotPasswordFace onSwitch={() => switchTo("login")} onClose={close} />
          ) : (
            <SignupFace onSwitch={() => switchTo("login")} onClose={close} />
          )}
        </div>
      </div>
    </div>
  );
}
