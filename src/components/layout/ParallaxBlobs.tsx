"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

/** GSAP background blobs: idle drift + mouse-follow parallax on the parent card. */
export function ParallaxBlobs({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const card = el?.parentElement;
    if (!el || !card) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const blobs = gsap.utils.toArray<HTMLElement>(el.children);

      // Per-blob idle drift (skip when the user prefers reduced motion).
      if (!reduce) {
        blobs.forEach((blob, i) => {
          gsap.to(blob, {
            x: () => gsap.utils.random(-55, 55),
            y: () => gsap.utils.random(-40, 40),
            scale: () => gsap.utils.random(0.8, 1.3),
            opacity: () => gsap.utils.random(0.5, 1),
            duration: () => gsap.utils.random(6, 10),
            delay: i * 0.4,
            repeat: -1,
            yoyo: true,
            repeatRefresh: true,
            ease: "sine.inOut",
          });
        });
      }
    }, el);

    // Smooth mouse-follow parallax on the whole layer.
    const xTo = gsap.quickTo(el, "xPercent", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "yPercent", { duration: 0.6, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      xTo(((e.clientX - r.left) / r.width - 0.5) * 8);
      yTo(((e.clientY - r.top) / r.height - 0.5) * 8);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0">
      {children}
    </div>
  );
}
