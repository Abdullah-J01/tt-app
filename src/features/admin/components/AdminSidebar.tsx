"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Tags, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/studybooks", label: "Studybooks", icon: BookOpen, exact: false },
  { href: "/admin/subjects", label: "Subjects", icon: Tags, exact: false },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
] as const;

/**
 * Admin section nav: sticky sidebar on desktop, horizontal scroll strip on
 * mobile (the CMS is desktop-first per the UI brief, but stays usable anywhere).
 */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin sections"
      className="no-scrollbar shrink-0 max-md:-mx-4 max-md:overflow-x-auto max-md:px-4 md:sticky md:top-6 md:w-52 md:self-start"
    >
      <ul className="flex gap-1 max-md:pb-1 md:flex-col">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="max-md:shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "bg-lavender text-violet font-semibold"
                    : "text-muted hover:bg-lavender/50 hover:text-ink font-medium",
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
