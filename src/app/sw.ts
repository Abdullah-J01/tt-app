/// <reference lib="webworker" />
//
// Serwist service worker — Instagram/X-style offline behaviour.
//
// Compiled by Serwist's own loader (not `tsc`), so it's excluded from the root
// tsconfig to avoid DOM/WebWorker lib clashes. `self.__SW_MANIFEST` is injected
// at build time with the precache list (this is our build-time cache version —
// every deploy revisions it, busting stale precached assets).
//
// Caching strategy (per resource type):
//   • navigations (HTML)  → NetworkFirst  → "pages-cache"  (fallback: cached home)
//   • RSC payloads        → NetworkFirst  → "pages-cache"  (so visited routes work offline)
//   • images              → CacheFirst    → "images-cache"
//   • fonts               → CacheFirst    → "fonts-cache"
//   • CSS                 → StaleWhileRevalidate → "css-cache"
//   • JS / workers        → StaleWhileRevalidate → "js-cache"
//   • API GET             → NetworkFirst  → "api-cache"    (offline: cached response)
//   • API POST/PUT/DELETE → NetworkOnly + BackgroundSync queue (replayed when online)
import {
  BackgroundSyncPlugin,
  CacheableResponsePlugin,
  CacheFirst,
  ExpirationPlugin,
  NavigationRoute,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
  type PrecacheEntry,
  type RouteHandlerCallbackOptions,
  type SerwistGlobalConfig,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const DAY = 24 * 60 * 60;

/** Home-page URL candidates (start_url "/" redirects to a locale-prefixed home). */
const HOME_CANDIDATES = ["/", "/et", "/en", "/ru"];

/** Cache names bumped together when the caching logic changes (see cleanup below). */
const CACHES = {
  pages: "pages-cache",
  images: "images-cache",
  fonts: "fonts-cache",
  css: "css-cache",
  js: "js-cache",
  api: "api-cache",
} as const;
const KNOWN_CACHES = new Set<string>(Object.values(CACHES));

/**
 * Next.js appends a volatile `?_rsc=<hash>` to React Server Component requests.
 * Stripping it from the cache key means a later offline request for the same
 * route resolves to the stored payload instead of missing on a changed hash.
 */
const normalizeRscKey = {
  cacheKeyWillBeUsed: async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    url.searchParams.delete("_rsc");
    return url.href;
  },
};

const only200 = new CacheableResponsePlugin({ statuses: [0, 200] });

// ── Strategies ────────────────────────────────────────────────────────────
const pagesStrategy = new NetworkFirst({
  cacheName: CACHES.pages,
  networkTimeoutSeconds: 3,
  plugins: [
    only200,
    new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * DAY, purgeOnQuotaError: true }),
  ],
});

const rscStrategy = new NetworkFirst({
  cacheName: CACHES.pages,
  networkTimeoutSeconds: 3,
  plugins: [
    normalizeRscKey,
    only200,
    new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * DAY, purgeOnQuotaError: true }),
  ],
});

const imagesStrategy = new CacheFirst({
  cacheName: CACHES.images,
  plugins: [
    only200,
    new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 30 * DAY, purgeOnQuotaError: true }),
  ],
});

const fontsStrategy = new CacheFirst({
  cacheName: CACHES.fonts,
  plugins: [
    only200,
    new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * DAY, purgeOnQuotaError: true }),
  ],
});

const cssStrategy = new StaleWhileRevalidate({
  cacheName: CACHES.css,
  plugins: [only200, new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * DAY })],
});

const jsStrategy = new StaleWhileRevalidate({
  cacheName: CACHES.js,
  plugins: [only200, new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 30 * DAY })],
});

const apiGetStrategy = new NetworkFirst({
  cacheName: CACHES.api,
  networkTimeoutSeconds: 5,
  plugins: [
    only200,
    new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 1 * DAY, purgeOnQuotaError: true }),
  ],
});

// Queue failed mutations and replay them when connectivity returns (max 24h old).
const mutationSync = new BackgroundSyncPlugin("api-mutations-queue", {
  maxRetentionTime: 24 * 60,
});
const apiMutationStrategy = new NetworkOnly({ plugins: [mutationSync] });

// ── Navigation handler: NetworkFirst, then cached home, then offline shell ──
const handleNavigation = async (options: RouteHandlerCallbackOptions): Promise<Response> => {
  try {
    const res = await pagesStrategy.handle(options);
    if (res) return res;
  } catch {
    // fall through to the offline fallbacks
  }
  const cache = await caches.open(CACHES.pages);
  for (const url of HOME_CANDIDATES) {
    const home = await cache.match(url, { ignoreSearch: true });
    if (home) return home;
  }
  const offline = await caches.match("/offline.html");
  return offline ?? Response.error();
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // RSC payloads (client-side navigations) — match before anything else.
    {
      matcher: ({ request, url, sameOrigin }) =>
        sameOrigin && (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")),
      handler: rscStrategy,
    },
    // API mutations → background sync (one entry per method).
    ...(["POST", "PUT", "DELETE", "PATCH"] as const).map((method) => ({
      matcher: ({ url, sameOrigin }: { url: URL; sameOrigin: boolean }) =>
        sameOrigin && url.pathname.startsWith("/api/"),
      handler: apiMutationStrategy,
      method,
    })),
    // API GET → NetworkFirst with cached fallback.
    {
      matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/api/"),
      handler: apiGetStrategy,
      method: "GET" as const,
    },
    // Images (incl. cross-origin Open Library covers).
    { matcher: ({ request }) => request.destination === "image", handler: imagesStrategy },
    // Fonts.
    {
      matcher: ({ request, url }) =>
        request.destination === "font" || /\.(?:woff2?|ttf|otf|eot)$/i.test(url.pathname),
      handler: fontsStrategy,
    },
    // CSS.
    { matcher: ({ request }) => request.destination === "style", handler: cssStrategy },
    // JS + web workers.
    {
      matcher: ({ request }) =>
        request.destination === "script" || request.destination === "worker",
      handler: jsStrategy,
    },
  ],
});

// Full-page navigations (cold launch / hard reload). Excludes API + Next internals.
serwist.registerRoute(
  new NavigationRoute(handleNavigation, {
    denylist: [/^\/api\//, /^\/_next\//, /\.[^/]+$/],
  }),
);

serwist.addEventListeners();

// Cache versioning cleanup: drop any runtime cache we no longer recognise so old
// strategies/names don't leak storage. (Serwist handles precache cleanup itself.)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.endsWith("-cache") && !KNOWN_CACHES.has(name))
          .map((name) => caches.delete(name)),
      );
    })(),
  );
});
