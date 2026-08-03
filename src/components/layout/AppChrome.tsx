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
    /* Flex column + `flex-1` on the content slot is what keeps the footer at the
       bottom. Without it the footer sits in normal flow directly under the
       content, so any page whose first paint is shorter than the viewport
       (Home, before its client-hydrated rows land) renders it floating
       mid-screen and then jerks it down. */
    <div className="bg-surface flex min-h-[100svh] flex-col">
      {!hideChrome && <Navbar />}
      {/* Spacer so content clears the fixed header — pages needn't add their own
          top margin. Immersive pages (feed) opt out with a negative margin
          (FeedScreen.tsx) that must match this value exactly. */}
      <div className="flex-1 pt-[calc(env(safe-area-inset-top)+5rem)] md:pt-[calc(env(safe-area-inset-top)+6rem)]">
        {children}
      </div>
      {!hideChrome && <ResponsiveFooter />}
    </div>
  );
}
