"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, DEFAULT_LOCALE, NAMESPACE, isLocale, type Locale } from "./config";

/**
 * Reads the active locale and switches it in place: changes the client i18next
 * language immediately (so every `useTranslations` consumer updates at once),
 * writes the `NEXT_LOCALE` cookie, then does a soft `router.refresh()` so
 * server-rendered text re-renders too — no full page reload, URL unchanged.
 * Powers the header language selector.
 */
export function useLocaleSwitch() {
  const { i18n } = useTranslation(NAMESPACE);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const locale = (isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE) as Locale;

  const setLocale = (next: Locale) => {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    // Switch the client language immediately (every consumer re-renders at once),
    // then soft-refresh so server-rendered text updates too — no full reload.
    void i18n.changeLanguage(next);
    startTransition(() => router.refresh());
  };

  return {
    locale,
    setLocale,
    pending,
    /** Flip between the two supported locales. */
    toggle: () => setLocale(locale === "en" ? "et" : "en"),
  };
}
