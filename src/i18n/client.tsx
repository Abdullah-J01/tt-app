"use client";

import i18next, { type i18n as I18nInstance } from "i18next";
import { initReactI18next, I18nextProvider, useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, type ReactNode } from "react";
import { DEFAULT_LOCALE, LOCALES, NAMESPACE, isLocale, type Locale } from "./config";
import { lookup, formatMessage, formatRich } from "./format";
import type { Translator, TranslateValues, RichValues } from "./types";
import enMessages from "./locales/en/common.json";
import etMessages from "./locales/et/common.json";
import ruMessages from "./locales/ru/common.json";

type Messages = Record<string, unknown>;

// Every locale is bundled and seeded up front, so switching languages on the
// client is instant and synchronous — no lazy fetch that could fail or flash.
const ALL_RESOURCES: Record<Locale, { [NAMESPACE]: Messages }> = {
  en: { [NAMESPACE]: enMessages as Messages },
  et: { [NAMESPACE]: etMessages as Messages },
  ru: { [NAMESPACE]: ruMessages as Messages },
};

function createI18n(locale: Locale): I18nInstance {
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: LOCALES as unknown as string[],
    ns: [NAMESPACE],
    defaultNS: NAMESPACE,
    resources: ALL_RESOURCES,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return instance;
}

/**
 * Keeps the client language locked to the URL's locale segment. usePathname
 * updates on every client navigation (switcher, links, back/forward), so this
 * makes a single click switch the language and never drift out of sync — even
 * though the root-layout provider itself doesn't re-render on navigation.
 */
function LocaleSync() {
  const { i18n } = useTranslation(NAMESPACE);
  const pathname = usePathname();
  const seg = pathname.split("/")[1];
  const urlLocale: Locale = isLocale(seg) ? seg : DEFAULT_LOCALE;

  useEffect(() => {
    if (i18n.language !== urlLocale) void i18n.changeLanguage(urlLocale);
  }, [i18n, urlLocale]);

  return null;
}

/**
 * Client i18n root — seeds react-i18next with every locale bundle so the first
 * render matches the server and language switches happen instantly in place.
 */
export function TranslationsProvider({
  locale,
  children,
}: {
  locale: Locale;
  /** Kept for API symmetry with the server layout; resources are bundled. */
  messages?: Messages;
  children: ReactNode;
}) {
  const instance = useMemo(() => createI18n(locale), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <I18nextProvider i18n={instance}>
      <LocaleSync />
      {children}
    </I18nextProvider>
  );
}

/** next-intl-compatible `useTranslations` on top of react-i18next + ICU. */
export function useTranslations(namespace?: string): Translator {
  const { i18n } = useTranslation(NAMESPACE);
  const locale = i18n.language;
  const messages = (i18n.getResourceBundle(locale, NAMESPACE) || {}) as Messages;

  const full = (key: string) => (namespace ? `${namespace}.${key}` : key);
  const t = ((key: string, values?: TranslateValues) =>
    formatMessage(lookup(messages, full(key)), locale, full(key), values)) as Translator;
  t.rich = (key: string, values?: RichValues) =>
    formatRich(lookup(messages, full(key)), locale, full(key), values);
  return t;
}

/** next-intl-compatible `useLocale`. */
export function useLocale(): string {
  const { i18n } = useTranslation(NAMESPACE);
  return i18n.language;
}
