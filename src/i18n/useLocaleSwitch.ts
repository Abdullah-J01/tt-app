"use client";

import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  NAMESPACE,
  isLocale,
  type Locale,
} from "./config";
import { stripLocale, localizeHref } from "./Link";

/**
 * Reads the active locale from the URL and switches it by navigating to the
 * same path under the new locale segment (e.g. /et/explore → /en/explore). Also
 * flips the client i18next language immediately (instant UI update) and mirrors
 * the choice into the `NEXT_LOCALE` cookie. Powers the header language selector.
 */
export function useLocaleSwitch() {
  const { i18n } = useTranslation(NAMESPACE);
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const seg = pathname.split("/")[1];
  const locale: Locale = isLocale(seg)
    ? seg
    : isLocale(i18n.language)
      ? (i18n.language as Locale)
      : DEFAULT_LOCALE;

  const setLocale = (next: Locale) => {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    void i18n.changeLanguage(next);

    // Canonicalize the current path, then translate its slugs to the new locale
    // (/et/avasta → /explore → /en/explore).
    const nextPath = localizeHref(stripLocale(pathname), next);
    startTransition(() => router.push(nextPath));
  };

  return {
    locale,
    setLocale,
    pending,
    /** Flip between the two selectable locales. */
    toggle: () => setLocale(locale === "en" ? "et" : "en"),
  };
}
