/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ──────────────────────────────────────────────────────────────
  // Capacitor (iOS / Android) packaging
  // The mobile wrapper loads a STATIC export of the web app.
  // When building for native, enable static export:
  //
  //   output: "export",
  //   images: { unoptimized: true },
  //
  // Keep these commented for normal server/SSR web + `next dev`.
  // See docs/MOBILE_PACKAGING.md for the full flow.
  // ──────────────────────────────────────────────────────────────

  // Temporary: dummy studybook covers come from Open Library (see
  // src/lib/openlibrary.ts). Remove once real covers come from the TT API.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "covers.openlibrary.org" }],
  },

  experimental: {
    // typedRoutes: true,
  },
};

export default nextConfig;
