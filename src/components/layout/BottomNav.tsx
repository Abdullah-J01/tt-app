"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/library", label: "Library", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: User },
];

/** Mobile bottom tab bar (UI brief §3). Hidden on md+ where TopNav is used. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
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
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
