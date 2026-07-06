"use client";

import { useEffect } from "react";

let lockCount = 0;
let prevBodyOverflow = "";
let prevHtmlOverflow = "";

/**
 * Locks page scroll while `locked` is true — sets body/html overflow hidden and
 * pauses Lenis smooth-scroll (which `overflow:hidden` alone doesn't stop).
 * Reference-counted so stacked dialogs don't release the lock prematurely.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    if (lockCount === 0) {
      prevBodyOverflow = document.body.style.overflow;
      prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      window.__lenis?.stop();
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        window.__lenis?.start();
      }
    };
  }, [locked]);
}
