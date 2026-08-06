"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link, { stripLocale } from "@/i18n/Link";
import { useSession } from "next-auth/react";
import { useTranslations } from "@/i18n/client";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import SearchBar from "../home/SearchBar";
import { Logo } from "./Logo";
import { LanguageMenu } from "./LanguageMenu";
import ProfileMenu from "./ProfileMenu";
import { StreakButton } from "@/features/streak";
import { AdminLogoutButton } from "@/features/admin";
import { useAuthModal } from "@/components/auth/useAuthModal";
import { SITE } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";


const NAVBAR_ANIMATED_KEY = "tt-navbar-animated";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [suppressScrollTransition, setSuppressScrollTransition] = useState(false);
  const [skipEntrance] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(NAVBAR_ANIMATED_KEY) === "1",
  );
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const path = stripLocale(pathname);
  const openAuth = useAuthModal((s) => s.openAuth);
  const t = useTranslations();
  // On the admin CMS the shared header swaps its consumer controls (nav, search,
  // streak) for the CMS ones (badge, "View app", session info, log out).
  const onAdmin = path.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      setSuppressScrollTransition(true);
      onScroll();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSuppressScrollTransition(false));
      });
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem(NAVBAR_ANIMATED_KEY, "1");
  }, []);

  return (
    <>
      <motion.header
        initial={skipEntrance ? false : { y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${
            suppressScrollTransition ? "" : "transition-all duration-500"
          } ${
            scrolled
              ? "pt-[calc(env(safe-area-inset-top)+0.75rem)]"
              : "pt-[calc(env(safe-area-inset-top)+1.5rem)]"
          }`}
        >
          <nav
            className={`flex items-center justify-between rounded-full ${
              suppressScrollTransition ? "" : "transition-all duration-500"
            } ${
              scrolled
                ? "glass shadow-soft border-border border px-4 py-2 sm:px-6"
                : "border border-transparent bg-transparent"
            }`}
          >
         
            <div className="flex shrink-0 items-center gap-6 lg:gap-8">
              <div className="flex items-center gap-2.5">
                <Logo className="h-6" href={onAdmin ? "/admin" : "/"} />
                {onAdmin && (
                  <Pill variant="solid" className="max-sm:hidden">
                    CMS
                  </Pill>
                )}
              </div>

              {/* Desktop consumer nav — hidden in the CMS (admin uses its sidebar). */}
              {!onAdmin && (
                <ul className="font-body text-ink/80 hidden items-center gap-6 text-sm lg:flex">
                  {SITE.nav.map((item) => {
                    const active = path === item.href || path.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`underline-anim ${
                            active ? "text-ink font-medium" : "hover:text-ink"
                          }`}
                        >
                          {t(`nav.${item.href.slice(1)}` as "nav.feed")}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Right cluster: search + language selector grouped together,
                then session actions. */}
            <div className="flex items-center gap-3 sm:gap-4">
              {onAdmin ? (
                <>
                  {session?.user?.name && (
                    <span className="text-muted text-sm whitespace-nowrap max-lg:hidden">
                      {t("nav.signedInAs")}{" "}
                      <span className="text-ink font-medium">{session.user.name}</span>
                    </span>
                  )}
                  <Link
                    // UI-cleanup test: feed hidden — "View app" lands on Home.
                    href="/home" // was "/feed"
                    className="text-violet hover:bg-lavender flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors"
                  >
                    {t("nav.viewApp")}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                  <AdminLogoutButton />
                </>
              ) : (
                <>
                  <SearchBar />
                  <div className="hidden lg:flex">
                    <LanguageMenu />
                  </div>
                  {status === "authenticated" && (
                    <>
                      <StreakButton />
                      {/* Profile dropdown (all sizes) — details, /profile, log out */}
                      <ProfileMenu />
                    </>
                  )}
                  {/* `unauthenticated` (not `!== authenticated`) so the Log in
                  button doesn't flash while the session is still loading. */}
                  {status === "unauthenticated" && (
                    // Opens the auth dialog over the current page instead of navigating.
                    <Button
                      onClick={() => openAuth("login")}
                      className="shadow-soft hover:shadow-glow rounded-full px-5 py-2 text-sm font-medium text-white transition-all duration-300"
                    >
                      {t("nav.login")}
                    </Button>
                  )}
                </>
              )}
            </div>
          </nav>
        </div>
      </motion.header>
    </>
  );
}
