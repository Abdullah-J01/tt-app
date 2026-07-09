"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/Button";
import { useAuthModal } from "./useAuthModal";

/** In-page "please sign in" panel with login + create-account actions. */
export function LoginRequired({ title, message }: { title?: string; message?: string }) {
  const t = useTranslations("components_auth_LoginRequired");
  const openAuth = useAuthModal((s) => s.openAuth);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="bg-lavender text-violet grid h-16 w-16 place-items-center rounded-full">
        <Lock className="h-7 w-7" />
      </span>
      <h2 className="text-ink text-xl font-bold">{title ?? t("title")}</h2>
      <p className="text-muted max-w-sm text-sm">{message ?? t("message")}</p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => openAuth("login")}>{t("login")}</Button>
        <Button variant="secondary" onClick={() => openAuth("signup")}>
          {t("createAccount")}
        </Button>
      </div>
    </div>
  );
}

/**
 * Renders children only for signed-in users; guests get the in-page sign-in
 * panel instead of a redirect. Auth state comes from the Redux auth slice.
 */
export function AuthGate({
  children,
  title,
  message,
}: {
  children: ReactNode;
  title?: string;
  message?: string;
}) {
  const status = useAppSelector((s) => s.auth.status);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (!isAuthenticated && status !== "loading") {
    return <LoginRequired title={title} message={message} />;
  }
  return <>{children}</>;
}
