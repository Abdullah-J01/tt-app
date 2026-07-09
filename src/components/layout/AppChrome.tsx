"use client";

import { usePathname } from "next/navigation";
import { stripLocale } from "@/i18n/Link";
import Navbar from "@/components/layout/Navbar";
import { ResponsiveFooter } from "@/components/layout/ResponsiveFooter";

/**
 * Client chrome for the authenticated app shell — just the bit that needs the
 * current path. On /feed (and nested) the experience is immersive, so the shared
 * Navbar and Footer are hidden; every other app page gets both. The server
 * layout owns the auth gate; this only decides what chrome to show.
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide header + footer on /feed and all nested routes (immersive).
  const hideChrome = stripLocale(pathname).startsWith("/feed");
  return (
    <div className="bg-surface min-h-[100svh]">
      {!hideChrome && <Navbar />}
      {/* Spacer so content clears the fixed header — pages needn't add their own
          top margin. Immersive pages (feed) opt out with a negative margin. */}
      <div className="pt-20 md:pt-24">{children}</div>
      {!hideChrome && <ResponsiveFooter />}
    </div>
  );
}
