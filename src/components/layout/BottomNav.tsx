"use client";

import Link, { stripLocale } from "@/i18n/Link";
import { useTranslations } from "@/i18n/client";
import { usePathname } from "next/navigation";
// Home + Bookmark stay imported-but-commented with their hidden tabs above.
import { Compass, User } from "lucide-react"; // Home, Bookmark
import { cn } from "@/lib/utils";

// UI-cleanup test: feed + library tabs hidden (kept in sync with SITE.nav).
const TABS = [
  // { href: "/feed", labelKey: "home", icon: Home },
  { href: "/explore", labelKey: "explore", icon: Compass },
  // { href: "/library", labelKey: "library", icon: Bookmark },
  { href: "/profile", labelKey: "profile", icon: User },
] as const;

/** Mobile bottom tab bar (UI brief §3). Hidden on md+ where TopNav is used. */
export function BottomNav() {
  const path = stripLocale(usePathname());
  const t = useTranslations("components_layout_BottomNav");

  // `bottom-0` + the safe-area padding below, nothing else. Lifting this by a
  // `visualViewport` gap is what made the bar jump mid-scroll on iOS — see the
  // note in `MobileNav` before trying it again.
  return (
    <nav className="border-hairline bg-surface/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-7xl items-stretch justify-between px-4 pb-[env(safe-area-inset-bottom)] sm:px-6 lg:px-8">
        {TABS.map((tab) => {
          const active = path === tab.href || path.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                  active ? "text-violet" : "text-muted hover:text-ink",
                )}
              >
                <Icon className="h-6 w-6" aria-hidden />
                {t(tab.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
