/** Supported UI locales. TaskuTark ships English, Estonian and Russian. */
export const LOCALES = ["en", "et", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

/** Locales offered in the language selector (Russian hidden for now). */
export const SELECTABLE_LOCALES: Locale[] = ["en", "et"];

/** English is the default locale. */
export const DEFAULT_LOCALE: Locale = "en";

/** Cookie that mirrors the active locale (also read by the middleware). */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Single flat namespace — the whole site lives in `common.json`. */
export const NAMESPACE = "common";

/** Human labels for the language selector. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  et: "Eesti",
  ru: "Русский",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
