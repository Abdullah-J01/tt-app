"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ExternalLink, Globe } from "lucide-react";
import SearchBar from "../home/SearchBar";
import { Logo } from "./Logo";
import ProfileMenu from "./ProfileMenu";
import { StreakButton } from "@/features/streak";
import { AdminLogoutButton } from "@/features/admin";
import { SITE } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  // On the admin CMS the shared header swaps its consumer controls (nav, search,
  // streak) for the CMS ones (badge, "View app", session info, log out).
  const onAdmin = pathname.startsWith("/admin");

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
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className={`underline-anim ${
                          active ? "text-ink font-medium" : "hover:text-ink"
                        }`}
                      >
                        {item.label}
                      </a>
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
                      Signed in as <span className="text-ink font-medium">{session.user.name}</span>
                    </span>
                  )}
                  <Link
                    href="/feed"
                    className="text-violet hover:bg-lavender flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors"
                  >
                    View app
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                  <AdminLogoutButton />
                </>
              ) : (
                <>
                  <SearchBar />
                  <Button
                    unstyled
                    className="text-ink/80 hover:text-ink hidden items-center gap-1.5 text-sm transition-colors md:flex"
                    aria-label="Select language"
                  >
                    <Globe size={16} />
                    EN
                  </Button>
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
                    <>
                      {/* <Link href="/login" className="hidden md:inline-flex"> */}
                      <a href="/login">
                        <Button className="shadow-soft hover:shadow-glow hidden rounded-full px-5 py-2 text-sm font-medium text-white transition-all duration-300 md:inline-flex">
                          Log in
                        </Button>
                      </a>
                      {/* </Link> */}
                      {/* Mobile: only the Login button (nav lives in the bottom bar) */}
                      <a href="/login">
                        <Button className="shadow-soft rounded-full px-5 py-2 text-sm font-medium text-white md:hidden">
                          Log in
                        </Button>
                      </a>
                    </>
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
