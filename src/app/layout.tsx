import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { TranslationsProvider } from "@/i18n/client";
import { getLocale, getTranslations } from "@/i18n/server";
import type { Locale } from "@/i18n/config";
import "./globals.css";
import SmoothScroll from "@/components/home/SmoothScroll";
import { Toaster } from "@/components/ui/Toaster";
import MobileNav from "@/components/layout/MobileNav";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AuthModal } from "@/components/auth/AuthModal";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { Providers } from "./providers";
import { SITE } from "@/config/site";
// Self-hosted fonts (from @fontsource, vendored in src/fonts) — no build-time
// request to Google Fonts, so builds are reproducible/offline-capable and no
// user data leaks to Google. Same families, weights and CSS variables as before.
const poppins = localFont({
  src: [
    { path: "../fonts/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/poppins-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "../fonts/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

/** Locale-independent metadata (icons, manifest, app name — the brand mark). */
const staticMetadata: Metadata = {
  manifest: "/manifest.webmanifest",
  applicationName: SITE.name,
  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

/**
 * Locale-aware document metadata. `SITE.tagline`/`SITE.description` are English
 * constants, so hard-coding them here made the tab title and meta description
 * English on every page regardless of the active locale (Estonian by default).
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    ...staticMetadata,
    title: { default: `${SITE.name} — ${t("tagline")}`, template: `%s · ${SITE.name}` },
    description: t("description"),
  };
}

export const viewport: Viewport = {
  themeColor: "#6c4ce3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
          style={{
            height: "calc(env(safe-area-inset-top) + 1px)",
            backgroundColor: "var(--status-bar-bg, var(--color-violet))",
          }}
          aria-hidden="true"
        />
        <TranslationsProvider locale={locale as Locale}>
          <Providers>
            <SmoothScroll>{children}</SmoothScroll>
            {/* Persistent mobile bottom nav — rendered once here so it stays on
              every screen (below lg). Pages own their top header; this owns the
              bottom bar, so no page can accidentally drop it. */}
            <MobileNav />
            {/* Floating back-to-top (desktop only) — shows once scrolled down. */}
            <ScrollToTop />
            {/* Global auth dialog — login/sign-up over the current page. */}
            <AuthModal />
            {/* Custom PWA install prompt (Android/Chromium + iOS hint). */}
            <InstallPrompt />
            <Toaster />
          </Providers>
        </TranslationsProvider>
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
