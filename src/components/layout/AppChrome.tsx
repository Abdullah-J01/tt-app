"use client";

import { usePathname } from "next/navigation";
import { stripLocale } from "@/i18n/Link";
import Navbar from "@/components/layout/Navbar";
import { ResponsiveFooter } from "@/components/layout/ResponsiveFooter";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide header + footer on /feed and all nested routes (immersive).
  const hideChrome = stripLocale(pathname).startsWith("/feed");
  return (

    <div className="bg-surface flex min-h-[100svh] flex-col">
      {!hideChrome && <Navbar />}

      <div className="flex-1 pt-[calc(env(safe-area-inset-top)+5rem)] md:pt-[calc(env(safe-area-inset-top)+6rem)]">
        {children}
      </div>
      {!hideChrome && <ResponsiveFooter />}
    </div>
  );
}
