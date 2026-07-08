import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/i18n/config";

/**
 * URL-prefixed locales (like rahvaraamat.ee/et, /en). Every page lives under a
 * locale segment. This middleware:
 *  - reads the locale from the URL and forwards it to the app via the
 *    `x-next-locale` request header (which `getLocale()` reads first),
 *  - keeps the `NEXT_LOCALE` cookie in sync with the URL,
 *  - redirects any unprefixed path to `/{locale}/…` (locale from cookie, else default).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathLocale = LOCALES.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  if (pathLocale) {
    const headers = new Headers(request.headers);
    headers.set("x-next-locale", pathLocale);
    const response = NextResponse.next({ request: { headers } });
    response.cookies.set(LOCALE_COOKIE, pathLocale, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    return response;
  }

  // No locale in the URL — send them to their preferred one.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip API routes, Next internals, and any file with an extension.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
