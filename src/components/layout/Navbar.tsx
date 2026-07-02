"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Globe, User } from "lucide-react";
import SearchBar from "../home/SearchBar";
import { Logo } from "./Logo";
import MobileNav from "./MobileNav";
import { SITE } from "@/config/site";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { status } = useSession();

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
          className={`mx-auto max-w-7xl px-5 transition-all duration-500 sm:px-8 ${
            scrolled ? "pt-3" : "pt-6"
          }`}
        >
          <nav
            className={`flex items-center justify-between rounded-full px-4 py-3 transition-all duration-500 sm:px-6 ${
              scrolled
                ? "glass shadow-soft border-border border"
                : "border border-transparent bg-transparent"
            }`}
          >
            <Logo />

            {/* Desktop nav — unchanged, md and up only */}
            <ul className="font-body text-ink/80 hidden items-center gap-8 text-sm md:flex">
              {SITE.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`underline-anim ${
                      item === SITE.nav[0] ? "text-ink font-medium" : "hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 sm:gap-4">
              <SearchBar />
              <button
                className="text-ink/80 hover:text-ink hidden items-center gap-1.5 text-sm transition-colors md:flex"
                aria-label="Select language"
              >
                <Globe size={16} />
                EN
              </button>
              {status === "authenticated" && (
                <a
                  href="/profile"
                  aria-label="Profile"
                  className="text-ink/80 hover:text-ink hidden items-center gap-1.5 text-sm transition-colors md:inline-flex"
                >
                  <User size={18} />
                </a>
              )}
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
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Native-app-style mobile chrome (bottom bar + More panel + search) */}
      <MobileNav />
    </>
  );
}
