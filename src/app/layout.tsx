import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { TranslationsProvider } from "@/i18n/client";
import { getLocale, getMessages } from "@/i18n/server";
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

export const metadata: Metadata = {
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  manifest: "/manifest.webmanifest",
  applicationName: SITE.name,
  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#6c4ce3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  return (
    <html lang={locale} className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        <TranslationsProvider locale={locale as Locale} messages={messages}>
          <Providers>
            <SmoothScroll>{children}</SmoothScroll>
            {/* Persistent mobile bottom nav — rendered once here so it stays on
              every screen (below md). Pages own their top header; this owns the
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
