"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "@/i18n/client";
import Link from "@/i18n/Link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  Check,
  ChevronDown,
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
import { useAuthModal } from "@/components/auth/useAuthModal";
import { useLocaleSwitch } from "@/i18n/useLocaleSwitch";
import { SELECTABLE_LOCALES, LOCALE_LABELS } from "@/i18n/config";
import { stripLocale } from "@/i18n/Link";
import { useSoftKeyboard } from "@/lib/useSoftKeyboard";
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
  const openAuth = useAuthModal((s) => s.openAuth);
  const t = useTranslations();
  const { locale, setLocale } = useLocaleSwitch();
  const [moreOpen, setMoreOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const keyboardOpen = useSoftKeyboard();

  // Immersive card surfaces — the "For You" feed and the studybook reader
  // (full page + intercepted modal, both end in /read) — take over the whole
  // screen so the reader can concentrate on one card. The bottom bar is hidden
  // there (mobile only); each surface owns its own back control instead. Every
  // other route keeps the persistent light-glass bar.
  const route = stripLocale(pathname);
  const immersive = route.startsWith("/feed") || route.endsWith("/read");
  const tabIdle = "text-ink/60 hover:text-ink";
  // Match the section, not just the exact page — /explore/search is still Explore.
  const isActive = (href: string) => route === href || route.startsWith(`${href}/`);

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

  // Collapse the language chooser whenever the More panel closes.
  useEffect(() => {
    if (!moreOpen) setLangOpen(false);
  }, [moreOpen]);

  const openSearch = () => {
    setMoreOpen(false);
    setSearchOpen(true);
  };

  // Immersive routes render no bar at all — bail after the hooks above so the
  // rules-of-hooks order stays stable across route changes.
  if (immersive) return null;

  return (
    <div className="md:hidden">
      {/* ── Search: blurred overlay + top-anchored glass field ─────────── */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.button
              type="button"
              aria-label={t("common.close")}
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
                  placeholder={t("common.searchPlaceholder")}
                  aria-label={t("common.search")}
                  className="text-ink placeholder:text-muted w-full bg-transparent text-base outline-none"
                />
                <Button
                  unstyled
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label={t("common.close")}
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
            aria-label={t("common.close")}
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
      {/* Stood down while the soft keyboard is up: `bottom-0` resolves against
        the layout viewport, which Android shrinks when the keyboard opens, so
        leaving it mounted marches the bar up over the page content. Hiding it
        gives the native behaviour — the bar sits still and the keyboard covers
        it. See `useSoftKeyboard`. */}
      <div className={cn("fixed inset-x-0 bottom-0 z-50", keyboardOpen && "hidden")}>
        <AnimatePresence>
          {moreOpen && (
            <motion.div
              id="mobile-more-panel"
              role="menu"
              aria-label={t("nav.more")}
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
                <span className="flex-1 text-left">{t("common.search")}</span>
                <ChevronRight size={18} className="text-faint shrink-0" aria-hidden />
              </Button>

              {/* Language: the globe row opens an inline EN/ET chooser. */}
              <Button
                unstyled
                type="button"
                role="menuitem"
                aria-expanded={langOpen}
                onClick={() => setLangOpen((v) => !v)}
                className="text-ink hover:bg-ink/5 active:bg-ink/10 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-medium transition-colors"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/60">
                  <Globe size={18} className="text-ink/70" aria-hidden />
                </span>
                <span className="flex-1 text-left">{t("common.language")}</span>
                <span className="text-muted shrink-0 text-sm">{locale.toUpperCase()}</span>
                <ChevronDown
                  size={18}
                  className={cn(
                    "text-faint shrink-0 transition-transform duration-200",
                    langOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </Button>

              <AnimatePresence initial={false}>
                {langOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    {SELECTABLE_LOCALES.map((l) => (
                      <Button
                        key={l}
                        unstyled
                        type="button"
                        role="menuitemradio"
                        aria-checked={l === locale}
                        onClick={() => {
                          setLocale(l);
                          setLangOpen(false);
                          setMoreOpen(false);
                        }}
                        className="text-ink hover:bg-ink/5 active:bg-ink/10 flex w-full items-center gap-3 rounded-2xl py-2.5 pr-3 pl-14 text-[15px] font-medium transition-colors"
                      >
                        <span className="flex-1 text-left">{LOCALE_LABELS[l]}</span>
                        {l === locale && (
                          <Check className="text-brand-green h-4 w-4 shrink-0" aria-hidden />
                        )}
                      </Button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

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
                  <span className="flex-1 text-left">{t("nav.adminDashboard")}</span>
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
                    {t("nav.logout")}
                  </Button>
                ) : (
                  <Button
                    block
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMoreOpen(false);
                      openAuth("login");
                    }}
                    className="rounded-2xl py-3 text-sm font-medium text-white"
                  >
                    {t("nav.login")}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav
          aria-label={t("nav.primary")}
          className="glass border-border border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(30,26,46,0.08)]"
        >
          <ul className="mx-auto flex max-w-7xl items-stretch justify-between px-4 sm:px-6 lg:px-8">
            {SITE.nav.map((item) => {
              const Icon = NAV_ICONS[item.href] ?? Circle;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-transform active:scale-95",
                      active ? "text-ink" : tabIdle,
                    )}
                  >
                    <Icon className="h-[22px] w-[22px]" aria-hidden />
                    {t(`nav.${item.href.slice(1)}`)}
                  </Link>
                </li>
              );
            })}

            {status === "authenticated" && (
              <li>
                <Link
                  href="/profile"
                  aria-current={isActive("/profile") ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-transform active:scale-95",
                    isActive("/profile") ? "text-ink" : tabIdle,
                  )}
                >
                  <User className="h-[22px] w-[22px]" aria-hidden />
                  {t("nav.profile")}
                </Link>
              </li>
            )}

            <li>
              <Button
                unstyled
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-label={t("nav.more")}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                aria-controls="mobile-more-panel"
                className={cn(
                  "flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-transform active:scale-95",
                  moreOpen ? "text-violet" : tabIdle,
                )}
              >
                <MoreHorizontal className="h-[22px] w-[22px]" aria-hidden />
                {t("nav.more")}
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
