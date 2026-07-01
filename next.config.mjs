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

  experimental: {
    // typedRoutes: true,
  },
};

export default nextConfig;
