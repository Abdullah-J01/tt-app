/**
 * Single source of truth for i18n (used by middleware, next-roots, runtime).
 * Estonian is the default; every locale carries a URL prefix (/et, /en, /ru).
 */
const i18nConfig = {
  locales: ["en", "et", "ru"],
  defaultLocale: "et",
  prefixDefault: true,
  localeDetector: false,
};

module.exports = i18nConfig;
