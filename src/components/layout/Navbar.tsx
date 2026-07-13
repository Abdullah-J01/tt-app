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
import { LanguageToggle } from "./LanguageToggle";
import ProfileMenu from "./ProfileMenu";
import { StreakButton } from "@/features/streak";
import { AdminLogoutButton } from "@/features/admin";
import { useAuthModal } from "@/components/auth/useAuthModal";
import { SITE } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
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
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={`mx-auto max-w-7xl px-4 transition-all duration-500 sm:px-6 lg:px-8 ${
            scrolled ? "pt-3" : "pt-6"
          }`}
        >
          <nav
            className={`flex items-center justify-between rounded-full transition-all duration-500 ${
              scrolled
                ? "glass shadow-soft border-border border px-4 py-2 sm:px-6"
                : "border border-transparent bg-transparent"
            }`}
          >
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
              <ul className="font-body text-ink/80 hidden items-center gap-8 text-sm md:flex">
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

            <div className="flex items-center gap-3 sm:gap-4">
              {onAdmin ? (
                <>
                  {session?.user?.name && (
                    <span className="text-muted text-sm whitespace-nowrap max-md:hidden">
                      {t("nav.signedInAs")}{" "}
                      <span className="text-ink font-medium">{session.user.name}</span>
                    </span>
                  )}
                  <Link
                    href="/feed"
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
                  <div className="hidden md:flex">
                    <LanguageMenu />
                  </div>
                  {/* Mobile: visible EN/ET toggle (the dropdown is desktop-only). */}
                  <LanguageToggle className="md:hidden" />
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
