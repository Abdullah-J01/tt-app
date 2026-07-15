"use client";

import { useEffect, type RefObject } from "react";
import { useMediaQuery } from "./useMediaQuery";

/**
 * Shared card-slideshow behaviour for StudybookReader and StudybookPreview, so
 * the two stay identical: swipe on touch, Prev/Next chevrons on desktop.
 * The matching controls live in `@/components/ui/SlideControls`.
 */

/** How far a card travels as it enters/leaves, in px. */
const TRAVEL = 64;
/** Shortest touch drag that counts as a swipe, in px. */
const SWIPE_MIN = 45;
/** How long navigation stays locked after a slide, so one gesture = one card. */
export const LOCK_MS = 500;

/** `dir` is +1 forward / -1 back; `axis` is the direction of travel. */
export type SlideCustom = { dir: number; axis: "x" | "y" };

const offset = (c: SlideCustom, on: "x" | "y", sign: number) =>
  c.axis === on ? (c.dir > 0 ? TRAVEL * sign : -TRAVEL * sign) : 0;

export const cardVariants = {
  enter: (c: SlideCustom) => ({ opacity: 0, x: offset(c, "x", 1), y: offset(c, "y", 1) }),
  center: { opacity: 1, x: 0, y: 0 },
  exit: (c: SlideCustom) => ({ opacity: 0, x: offset(c, "x", -1), y: offset(c, "y", -1) }),
};

/**
 * Cards travel sideways on desktop, to agree with the Prev/Next chevrons, and
 * vertically on touch, to follow the swipe. Mirrors the `lg:` breakpoint at
 * which SlideControls swaps the hint for the chevrons.
 */
export function useSlideAxis(): "x" | "y" {
  return useMediaQuery("(min-width: 1024px)") ? "x" : "y";
}

/**
 * Vertical swipe on `ref`: up → next, down → prev. Pass stable (useCallback'd)
 * handlers — they're effect deps, so fresh ones rebind the listeners each render.
 */
export function useSwipeNav(
  ref: RefObject<HTMLElement | null>,
  onNext: () => void,
  onPrev: () => void,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startY: number | null = null;

    function onStart(e: TouchEvent) {
      startY = e.touches[0]?.clientY ?? null;
    }
    function onEnd(e: TouchEvent) {
      if (startY === null) return;
      const endY = e.changedTouches[0]?.clientY ?? startY;
      const delta = startY - endY;
      startY = null;
      if (Math.abs(delta) < SWIPE_MIN) return;
      if (delta > 0) onNext();
      else onPrev();
    }

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [ref, onNext, onPrev]);
}
