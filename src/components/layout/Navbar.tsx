"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import SearchBar from "../home/SearchBar";

const links = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Library", href: "/library" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
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
          className={`glass flex items-center justify-between rounded-full px-4 py-3 transition-all duration-500 sm:px-6 ${
            scrolled ? "shadow-soft border-border border" : "border border-transparent"
          }`}
        >
          <a href="/" className="font-display text-ink text-lg font-semibold tracking-tight">
            StudyBooks
          </a>

          <ul className="font-body text-ink/80 hidden items-center gap-8 text-sm md:flex">
            {links.map((link, i) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={`underline-anim ${
                    i === 0 ? "text-ink font-medium" : "hover:text-ink"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 sm:gap-4">
            <SearchBar />
            <button
              className="text-ink/80 hover:text-ink hidden items-center gap-1.5 text-sm transition-colors sm:flex"
              aria-label="Select language"
            >
              <Globe size={16} />
              EN
            </button>
            <button className="bg-ink hover:bg-violet rounded-full px-5 py-2 text-sm font-medium text-white transition-colors duration-300">
              Log in
            </button>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
