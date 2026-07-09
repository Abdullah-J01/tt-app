import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/i18n/config";
import { localizePath, canonicalizePath } from "@/i18n/slugs";

/**
 * URL-prefixed, slug-translated locales (like rahvaraamat.ee/et, /en). Estonian
 * shows translated slugs (/et/avasta), which are rewritten to the canonical
 * physical route (/et/explore) so the app still resolves. This middleware:
 *  - reads the URL locale and forwards it via the `x-next-locale` request header,
 *  - keeps the `NEXT_LOCALE` cookie in sync with the URL,
 *  - rewrites localized slugs to the canonical route,
 *  - redirects any unprefixed path to its localized `/{locale}/…` form.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathLocale = LOCALES.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  if (pathLocale) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-next-locale", pathLocale);

    // Map the (possibly localized) slugs back to the canonical physical route.
    const rest = pathname.slice(`/${pathLocale}`.length) || "/";
    const canonicalRest = canonicalizePath(rest, pathLocale);
    const canonicalPath =
      canonicalRest === "/" ? `/${pathLocale}` : `/${pathLocale}${canonicalRest}`;

    let response: NextResponse;
    if (canonicalPath !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = canonicalPath;
      response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    } else {
      response = NextResponse.next({ request: { headers: requestHeaders } });
    }
    response.cookies.set(LOCALE_COOKIE, pathLocale, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    return response;
  }

  // No locale in the URL — send them to their preferred, slug-translated one.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const localized = localizePath(pathname === "/" ? "/" : pathname, locale);
  const url = request.nextUrl.clone();
  url.pathname = localized === "/" ? `/${locale}` : `/${locale}${localized}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip API routes, Next internals, and any file with an extension.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
