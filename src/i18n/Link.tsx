"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type ComponentProps } from "react";
import { LOCALES, DEFAULT_LOCALE, isLocale, type Locale } from "./config";

type NextLinkProps = ComponentProps<typeof NextLink>;

/** Active locale from the first URL segment (e.g. /et/explore → "et"). */
export function useCurrentLocale(): Locale {
  const pathname = usePathname();
  const seg = pathname.split("/")[1];
  return isLocale(seg) ? seg : DEFAULT_LOCALE;
}

/** Strip a leading locale segment: /et/feed → /feed, /et → /. */
export function stripLocale(pathname: string): string {
  const first = pathname.split("/")[1];
  if (isLocale(first)) return pathname.slice(first.length + 1) || "/";
  return pathname;
}

/** Active pathname with the locale segment removed (for nav active-state checks). */
export function useUnlocalizedPathname(): string {
  return stripLocale(usePathname());
}

/** Prefix an internal, absolute path with the locale (skips already-prefixed). */
export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/")) return href; // external, hash, relative
  const first = href.split("/")[1];
  if (isLocale(first)) return href; // already localized
  return `/${locale}${href}`;
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
