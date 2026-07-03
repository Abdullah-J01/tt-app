"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * Shell for the authenticated app (feed, explore, library, profile).
 * Uses the shared site header (Navbar) — the same one as the marketing pages —
 * which brings the desktop top bar and the mobile bottom bar with it.
 *
 * TODO(team): gate this layout behind an auth check (redirect to /login).
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide footer on /feed and all nested routes
  const hideFooter = pathname.startsWith("/feed");
  return (
    <div className="bg-surface min-h-[100svh]">
      {!hideFooter && <Navbar />}
      {/* Spacer so content clears the fixed header — pages needn't add their own
          top margin. Immersive pages (feed) opt out with a negative margin. */}
      <div className="pt-20 md:pt-24">{children}</div>
      {!hideFooter && <Footer />}
    </div>
  );
}
