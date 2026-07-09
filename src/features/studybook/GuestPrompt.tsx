"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { useAuthModal } from "@/components/auth/useAuthModal";
import { useTranslations } from "@/i18n/client";

/**
 * When a signed-out visitor opens a studybook (e.g. by tapping a book in
 * Explore), the login popup appears over it. Dismissing goes back — so a guest
 * lands back on the page they came from instead of a dead end.
 */
export function GuestPrompt() {
  const status = useAppSelector((s) => s.auth.status);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const openAuth = useAuthModal((s) => s.openAuth);
  const t = useTranslations("components_feed_ActionRail");
  const shown = useRef(false);

  useEffect(() => {
    if (status !== "loading" && !isAuthenticated && !shown.current) {
      shown.current = true;
      openAuth("login", { backOnClose: true, reason: t("loginToLearn") });
    }
  }, [status, isAuthenticated, openAuth, t]);

  return null;
}
