import type { Locale } from "./config";

/** Bundled loaders for each locale's message catalogue. */
const loaders: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import("./locales/en/common.json"),
  et: () => import("./locales/et/common.json"),
  ru: () => import("./locales/ru/common.json"),
};

const cache = new Map<Locale, Record<string, unknown>>();

/** Load (and cache) the full message object for a locale. */
export async function loadMessages(locale: Locale): Promise<Record<string, unknown>> {
  let messages = cache.get(locale);
  if (!messages) {
    messages = (await loaders[locale]()).default;
    cache.set(locale, messages);
  }
  return messages;
}
