"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";

/**
 * Floating "back to top" button. Appears once the page is scrolled down a bit
 * and smoothly returns to the top. Desktop only (md+) — on smaller screens the
 * bottom nav already occupies that corner. Uses the shared Lenis instance when
 * present so the scroll matches the rest of the page (plain window.scrollTo
 * doesn't stick while Lenis is driving the scroll).
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={toTop}
          aria-label="Scroll to top"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          whileHover={{ y: -3, boxShadow: "0 16px 40px rgb(var(--color-violet-rgb) / 0.4)" }}
          whileTap={{ scale: 0.92 }}
          className="bg-violet hover:bg-violet-dark shadow-lift fixed right-6 bottom-6 z-40 hidden h-12 w-12 place-items-center rounded-full text-white transition-colors md:grid"
        >
          {/* Soft pulsing ring to draw the eye. */}
          {!reduced && (
            <motion.span
              aria-hidden
              className="border-violet/40 absolute inset-0 rounded-full border-2"
              animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          {/* Arrow gently bobs upward to hint the direction. */}
          <motion.span
            animate={reduced ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowUp className="h-5 w-5" aria-hidden />
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
