"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { useAuthModal } from "@/components/auth/useAuthModal";
import { useTranslations } from "@/i18n/client";

/**
 * When a signed-out visitor opens a *paid* studybook (e.g. by tapping a book in
 * Explore), the login popup appears over it. Dismissing goes back — so a guest
 * lands back on the page they came from instead of a dead end.
 *
 * Free books skip this: guests may browse the detail page and read the first few
 * cards in the reader before being asked to log in (see {@link isFreeBook}).
 */
export function GuestPrompt({ free = false }: { free?: boolean }) {
  const status = useAppSelector((s) => s.auth.status);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const openAuth = useAuthModal((s) => s.openAuth);
  const t = useTranslations("components_feed_ActionRail");
  const shown = useRef(false);

  useEffect(() => {
    if (free) return; // free books: let guests read a couple of cards first
    if (status !== "loading" && !isAuthenticated && !shown.current) {
      shown.current = true;
      openAuth("login", { backOnClose: true, reason: t("loginToLearn") });
    }
  }, [free, status, isAuthenticated, openAuth, t]);

  return null;
}
