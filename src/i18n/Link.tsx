"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type ComponentProps } from "react";
import { LOCALES, DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import { localizePath, canonicalizePath } from "./slugs";

type NextLinkProps = ComponentProps<typeof NextLink>;

/** Active locale from the first URL segment (e.g. /et/explore → "et"). */
export function useCurrentLocale(): Locale {
  const pathname = usePathname();
  const seg = pathname.split("/")[1];
  return isLocale(seg) ? seg : DEFAULT_LOCALE;
}

/**
 * Strip the locale segment AND map localized slugs back to canonical, so nav
 * active-state checks compare against canonical hrefs: /et/avasta → /explore.
 */
export function stripLocale(pathname: string): string {
  const first = pathname.split("/")[1];
  if (!isLocale(first)) return pathname;
  const rest = pathname.slice(first.length + 1) || "/";
  return canonicalizePath(rest, first);
}

/** Active pathname with the locale segment removed (for nav active-state checks). */
export function useUnlocalizedPathname(): string {
  return stripLocale(usePathname());
}

/**
 * Prefix an internal canonical path with the locale and translate its slugs:
 * `/explore` → `/et/avasta`. Already-localized or external hrefs pass through.
 */
export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/")) return href; // external, hash, relative
  const first = href.split("/")[1];
  if (isLocale(first)) return href; // already localized
  const localized = localizePath(href, locale);
  return localized === "/" ? `/${locale}` : `/${locale}${localized}`;
}

/**
 * Drop-in replacement for `next/link` that keeps the active locale in the URL.
 * String hrefs like `/explore` become `/et/explore`; object hrefs and external
 * links pass through unchanged.
 */
const Link = forwardRef<HTMLAnchorElement, NextLinkProps>(function Link(
  { href, ...props },
  ref,
) {
  const locale = useCurrentLocale();
  const localized = typeof href === "string" ? localizeHref(href, locale) : href;
  return <NextLink ref={ref} href={localized} {...props} />;
});

export default Link;
export { LOCALES };
