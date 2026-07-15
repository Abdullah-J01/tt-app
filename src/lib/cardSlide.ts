"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { useMediaQuery } from "./useMediaQuery";

/**
 * Card-slideshow behaviour shared by StudybookReader and StudybookPreview, which
 * are meant to behave identically: swipe on touch, Prev/Next chevrons on desktop
 * (see `@/components/ui/SlideControls`), one gesture = one card via LOCK_MS.
 *
 * Transitions are plain CSS (`sb-card-*` in globals.css), picked by
 * `useSlideAxis()` so the motion always follows the input: cards slide vertically
 * under a swipe, horizontally under the chevrons. `transitionPair()` maps an axis
 * and direction onto that pair of classes.
 */

/** Shortest touch drag that counts as a swipe, in px. */
const SWIPE_MIN = 45;
/** How long navigation stays locked after a transition, so one gesture = one card. */
export const LOCK_MS = 500;

/** A transition in flight: `from` is the card being left, `dir` +1 fwd / -1 back. */
export type Turn = { from: number; dir: number };

/** What the two rendered copies do while `turn` runs. */
export interface TransitionPair {
  /** Class for the card being left. */
  outgoing: string;
  /** Class for the card being entered. */
  incoming: string;
}

/**
 * Both copies slide and cross-fade, always along the axis the input moves:
 * horizontally under the Prev/Next chevrons, vertically under a swipe. The copies
 * stay transparent, so only the content travels over a static background.
 */
export function transitionPair(axis: "x" | "y", dir: number): TransitionPair {
  const way = axis === "x" ? (dir > 0 ? "left" : "right") : dir > 0 ? "up" : "down";
  return { outgoing: `anim-card-out-${way}`, incoming: `anim-card-in-${way}` };
}

/**
 * Cards travel sideways on desktop, to agree with the Prev/Next chevrons, and
 * vertically on touch, to follow the swipe. Mirrors the `lg:` breakpoint at
 * which SlideControls swaps the hint for the chevrons.
 */
export function useSlideAxis(): "x" | "y" {
  return useMediaQuery("(min-width: 1024px)") ? "x" : "y";
}

/**
 * Owns the transition in flight.
 *
 * `begin()` returns false when motion is reduced: nothing animates, so the caller
 * should also skip its nav lock — there's nothing to wait for. Under reduced
 * motion no second copy is rendered at all, deliberately. With no animation there
 * is no animationend, so a copy rendered then would never be cleaned up and would
 * sit on top of the content forever.
 *
 * Wire `end` to onAnimationEnd on BOTH copies — on desktop only one of them
 * animates, and which one depends on direction. Guard it with
 * `e.target === e.currentTarget`, or a child's animation will bubble up and
 * retire the transition early.
 */
export function useCardTurn() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [turn, setTurn] = useState<Turn | null>(null);

  const end = useCallback(() => setTurn(null), []);

  const begin = useCallback(
    (from: number, dir: number) => {
      if (reduced) return false;
      setTurn({ from, dir });
      return true;
    },
    [reduced],
  );

  // Backstop: if animationend never lands (interrupted, tab hidden mid-turn),
  // retire the copy anyway rather than leave it stuck over the content.
  useEffect(() => {
    if (!turn) return;
    const id = window.setTimeout(end, LOCK_MS + 200);
    return () => window.clearTimeout(id);
  }, [turn, end]);

  return { turn, begin, end };
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
