"use client";

import { usePathname } from "next/navigation";
import { stripLocale } from "@/i18n/Link";
import { Footer } from "./Footer";

/**
 * Footer visibility wrapper. On mobile the "download the app" footer only shows
 * on the home page (`/`); every other screen hides it below md. Desktop is
 * unchanged — the footer shows wherever it's rendered.
 */
export function ResponsiveFooter() {
  const isHome = stripLocale(usePathname()) === "/";
  return (
    <div className={isHome ? undefined : "hidden md:block"}>
      <Footer />
    </div>
  );
}
