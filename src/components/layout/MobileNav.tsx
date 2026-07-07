"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  ChevronRight,
  Circle,
  Compass,
  Globe,
  Home,
  MoreHorizontal,
  Search,
  ShieldCheck,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { SITE } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

/** Icon per primary nav route — mirrors the app's BottomNav vocabulary. */
const NAV_ICONS: Record<string, LucideIcon> = {
  "/feed": Home,
  "/explore": Compass,
  "/library": Bookmark,
};

/**
 * Native-app-style mobile chrome for the marketing header (below md only).
 *
 * - Fixed glass bottom bar: primary nav + a three-dot "More".
 * - "More" opens a glassmorphic floating panel above the bar (macOS-style
 *   curved, detached card) that holds Search / Language / Log in.
 * - Search opens a top-anchored glass search field over a blurred full-screen
 *   overlay. All transitions are spring-driven for a premium feel.
 *
 * Desktop is untouched — this whole tree is `md:hidden`.
 */
export default function MobileNav() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll and close on Escape whenever an overlay is showing.
  useEffect(() => {
    if (!moreOpen && !searchOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMoreOpen(false);
      setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [moreOpen, searchOpen]);

  // Focus the field once the search panel has animated in.
  useEffect(() => {
    if (!searchOpen) return;
    const id = window.setTimeout(() => searchInputRef.current?.focus(), 240);
    return () => window.clearTimeout(id);
  }, [searchOpen]);

  const openSearch = () => {
    setMoreOpen(false);
    setSearchOpen(true);
  };

  return (
    <div className="md:hidden">
      {/* ── Search: blurred overlay + top-anchored glass field ─────────── */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-ink/20 fixed inset-0 z-[60] backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: -28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -28 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="fixed inset-x-0 top-0 z-[70] px-4 pt-[max(env(safe-area-inset-top),0.75rem)]"
            >
              <div className="glass border-border shadow-lift focus-within:ring-violet/30 mt-2 flex items-center gap-2.5 rounded-2xl border px-4 py-3 focus-within:ring-2">
                <Search size={20} className="text-muted shrink-0" aria-hidden />
                <Input
                  unstyled
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search studybooks, subjects…"
                  aria-label="Search studybooks, subjects"
                  className="text-ink placeholder:text-muted w-full bg-transparent text-base outline-none"
                />
                <Button
                  unstyled
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="text-ink/60 hover:text-ink hover:bg-ink/5 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
                >
                  <X size={18} />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── "More" backdrop — tap anywhere to dismiss ──────────────────── */}
      <AnimatePresence>
        {moreOpen && (
          <motion.button
            type="button"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-ink/10 fixed inset-0 z-40 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {/* ── Bottom bar (with the floating panel stacked above it) ──────── */}
      <div className="fixed inset-x-0 bottom-0 z-50">
        <AnimatePresence>
          {moreOpen && (
            <motion.div
              id="mobile-more-panel"
              role="menu"
              aria-label="More"
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 330, damping: 30 }}
              style={{ transformOrigin: "bottom center" }}
              className="glass border-border shadow-lift mx-3 mb-3 overflow-hidden rounded-[28px] border p-2"
            >
              {/* macOS-style grabber */}
              <div className="bg-ink/15 mx-auto mt-1 mb-1.5 h-1 w-10 rounded-full" />

              <Button
                unstyled
                type="button"
                role="menuitem"
                onClick={openSearch}
                className="text-ink hover:bg-ink/5 active:bg-ink/10 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-medium transition-colors"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/60">
                  <Search size={18} className="text-ink/70" aria-hidden />
                </span>
                <span className="flex-1 text-left">Search</span>
                <ChevronRight size={18} className="text-faint shrink-0" aria-hidden />
              </Button>

              <Button
                unstyled
                type="button"
                role="menuitem"
                className="text-ink hover:bg-ink/5 active:bg-ink/10 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-medium transition-colors"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/60">
                  <Globe size={18} className="text-ink/70" aria-hidden />
                </span>
                <span className="flex-1 text-left">Language</span>
                <span className="text-muted shrink-0 text-sm">EN</span>
              </Button>

              {isAdmin && (
                <Link
                  href="/admin"
                  role="menuitem"
                  onClick={() => setMoreOpen(false)}
                  className="text-ink hover:bg-ink/5 active:bg-ink/10 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-medium transition-colors"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/60">
                    <ShieldCheck size={18} className="text-ink/70" aria-hidden />
                  </span>
                  <span className="flex-1 text-left">Admin dashboard</span>
                  <ChevronRight size={18} className="text-faint shrink-0" aria-hidden />
                </Link>
              )}

              <div className="px-2 py-2">
                {status === "authenticated" ? (
                  <Button
                    block
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMoreOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="rounded-2xl py-3 text-sm font-medium text-white"
                  >
                    Log out
                  </Button>
                ) : (
                  <Link href="/login" onClick={() => setMoreOpen(false)}>
                    <Button block className="rounded-2xl py-3 text-sm font-medium text-white">
                      Log in
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav
          aria-label="Primary"
          className="glass border-border border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(30,26,46,0.08)]"
        >
          <ul className="mx-auto flex max-w-7xl items-stretch justify-between px-4 sm:px-6 lg:px-8">
            {SITE.nav.map((item, i) => {
              const Icon = NAV_ICONS[item.href] ?? Circle;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-transform active:scale-95",
                      i === 0 ? "text-ink" : "text-ink/60 hover:text-ink",
                    )}
                  >
                    <Icon className="h-[22px] w-[22px]" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}

            {status === "authenticated" && (
              <li>
                <Link
                  href="/profile"
                  className="text-ink/60 hover:text-ink flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-transform active:scale-95"
                >
                  <User className="h-[22px] w-[22px]" aria-hidden />
                  Profile
                </Link>
              </li>
            )}

            <li>
              <Button
                unstyled
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-label="More"
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                aria-controls="mobile-more-panel"
                className={cn(
                  "flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-transform active:scale-95",
                  moreOpen ? "text-violet" : "text-ink/60 hover:text-ink",
                )}
              >
                <MoreHorizontal className="h-[22px] w-[22px]" aria-hidden />
                More
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
