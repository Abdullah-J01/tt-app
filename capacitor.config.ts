import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor is configured to load the DEPLOYED web app (Vercel) rather than a
 * static export. This keeps full SSR, API routes, next-auth and Stripe working
 * inside the native shell — the app is essentially a hardened WebView onto the
 * live site, with native plugins bridged in.
 *
 *   server.url          → the production origin the WebView loads
 *   server.errorPath    → bundled page loaded when the main-frame navigation
 *                         FAILS (e.g. offline cold-launch). Capacitor resolves it
 *                         against the LOCAL asset host (https://localhost/…), which
 *                         is always reachable offline — so the WebView never shows
 *                         its own ERR_INTERNET_DISCONNECTED / net-error page.
 *                         Wired natively on Android (BridgeWebViewClient
 *                         .onReceivedError) and iOS (WebViewDelegationHandler
 *                         .didFailProvisionalNavigation) — no custom native code.
 *   server.allowNavigation → extra hosts the WebView may navigate to (OAuth,
 *                            Stripe Checkout, etc.). Add providers as you wire them.
 *   webDir ("www")      → bundled assets (incl. offline.html) served from the
 *                         local host and shipped inside the app.
 *
 * NOTE: A thin remote wrapper can be flagged under App Store Guideline 4.2 /
 * Play "minimum functionality" — the native plugins added in Phase 4 are what
 * give it genuine native capability. See docs/MOBILE_PACKAGING.md.
 */
const config: CapacitorConfig = {
  appId: "ee.taskutark.studybooks",
  appName: "TaskuTark",
  webDir: "www",
  server: {
    url: "https://tt-app-livid.vercel.app",
    errorPath: "offline.html",
    androidScheme: "https",
    iosScheme: "https",
    cleartext: false,
    allowNavigation: [
      "tt-app-livid.vercel.app",
      // OAuth / payment hosts the WebView is allowed to navigate to:
      "accounts.google.com",
      "*.stripe.com",
      "checkout.stripe.com",
    ],
  },
};

export default config;
