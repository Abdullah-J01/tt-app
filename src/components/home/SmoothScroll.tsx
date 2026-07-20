"use client";

import { ReactNode, useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;
    // Expose the instance so full-screen modals (e.g. the studybook reader) can
    // reset/freeze the page scroll behind them — plain window.scrollTo doesn't
    // stick while Lenis is driving the scroll.
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    // Keep the reference. gsap.ticker.remove() matches by identity, so passing
    // a freshly-built arrow function here removed nothing and every mount
    // leaked a callback still driving a destroyed Lenis once per frame —
    // they pile up across Fast Refreshes until the page misbehaves.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Unhook before destroying, so no in-flight frame can touch a dead Lenis.
      gsap.ticker.remove(raf);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
