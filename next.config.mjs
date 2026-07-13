import withSerwistInit from "@serwist/next";

/**
 * PWA service worker (Serwist — the maintained successor to next-pwa, which does
 * NOT support Next 16). Serwist hooks Next's webpack pipeline, so the production
 * build must run with `--webpack` (see the `build` script in package.json);
 * Next 16 defaults to Turbopack, under which the SW would silently not generate.
 * Disabled in dev so `next dev` (Turbopack) stays fast and un-cached.
 */
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

/**
 * Security headers applied to every response. NOTE: a full Content-Security-Policy
 * is intentionally deferred to the Production phase — this app runs next-auth +
 * Stripe (js.stripe.com, hooks.stripe.com frames) and a strict CSP added blindly
 * would break login/checkout. The headers below are safe for the live app today.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Grant the native/web app the device capabilities the native features need.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(self)" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Serwist injects a `webpack` config even when disabled in dev. Next 16 runs
  // `next dev` on Turbopack by default and errors on a webpack config with no
  // matching turbopack config; an empty object marks the setup as intentional
  // and silences that error without affecting the `--webpack` production build.
  turbopack: {},

  // Dummy studybook covers come from Open Library (see src/lib/openlibrary.ts).
  images: {
    remotePatterns: [{ protocol: "https", hostname: "covers.openlibrary.org" }],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  experimental: {
    // typedRoutes: true,
  },
};

export default withSerwist(nextConfig);
