import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  NAMESPACE,
  isLocale,
  type Locale,
} from "./config";
import { loadMessages } from "./resources";
import { lookup, formatMessage, formatRich } from "./format";
import type { Translator, TranslateValues, RichValues } from "./types";

/**
 * Active locale for the current request. Prefers the `x-next-locale` header set
 * by the middleware (URL-derived); falls back to the cookie, then the default.
 */
export async function getLocale(): Promise<Locale> {
  // Lazy-load next/headers so this module can be safely tree-shaken into client
  // bundles (via shared barrels) without tripping the server-only import guard.
  const { cookies, headers } = await import("next/headers");

  const requestHeaders = await headers();
  const fromHeader = requestHeaders.get("x-next-locale");
  if (isLocale(fromHeader)) return fromHeader;

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(fromCookie) ? fromCookie : DEFAULT_LOCALE;
}

/** Full message object for a locale (defaults to the request locale). */
export async function getMessages(locale?: Locale): Promise<Record<string, unknown>> {
  return loadMessages(locale ?? (await getLocale()));
}

/**
 * next-intl-compatible `getTranslations` for server components. Accepts either a
 * namespace string or `{ locale, namespace }`.
 */
export async function getTranslations(
  arg?: string | { locale?: Locale; namespace?: string },
): Promise<Translator> {
  const namespace = typeof arg === "string" ? arg : arg?.namespace;
  const locale =
    typeof arg === "object" && arg?.locale ? arg.locale : await getLocale();
  const messages = await loadMessages(locale);

  const full = (key: string) => (namespace ? `${namespace}.${key}` : key);
  const t = ((key: string, values?: TranslateValues) =>
    formatMessage(lookup(messages, full(key)), locale, full(key), values)) as Translator;
  t.rich = (key: string, values?: RichValues) =>
    formatRich(lookup(messages, full(key)), locale, full(key), values);
  return t;
}
