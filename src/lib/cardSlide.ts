"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
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
/** Accumulated wheel delta that counts as one gesture. */
const WHEEL_MIN = 40;
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
 * Keeps the newest handlers reachable from listeners bound once, so navigation
 * callbacks never appear in an effect's deps. They otherwise decide *when* the
 * listeners bind, which is a trap for overlays — see `enabled` below.
 */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

/**
 * Swipe on `ref`: up/left → next, down/right → prev, whichever axis the finger
 * actually travelled furthest along (so it works the same in portrait and
 * landscape, and under the horizontal desktop transition).
 *
 * Built on Pointer events, not Touch events, which is the load-bearing choice
 * here. Touch events are the fragile path: the browser can decide mid-drag that
 * a gesture is really a pan or an overscroll, claim it, and fire `touchcancel`
 * with no `touchend` — an end-driven swipe then silently does nothing, and it
 * fails differently across iOS Safari, Android Chrome and DevTools emulation.
 * Pointer events are one code path for touch, pen and mouse, so the same drag
 * also works with a mouse on desktop.
 *
 * Two things this relies on:
 * - The element needs `touch-action: none` (`touch-none`), or the browser
 *   consumes the drag as scrolling and stops sending `pointermove`. Both screens
 *   set it; a new caller that forgets will see no swipe at all.
 * - It fires the moment the threshold is crossed, not on release, so navigation
 *   feels immediate and never depends on a clean end event arriving.
 *
 * `enabled` exists because a ref can't announce that its element mounted. When
 * the target renders conditionally — a closed overlay renders `null` — the first
 * effect run finds `ref.current === null` and binds nothing, and nothing re-runs
 * it once the element appears. Pass the same condition that renders the element
 * (e.g. StudybookPreview's `open`) so binding happens on the commit that mounts it.
 */
export function useSwipeNav(
  ref: RefObject<HTMLElement | null>,
  onNext: () => void,
  onPrev: () => void,
  enabled = true,
) {
  const next = useLatest(onNext);
  const prev = useLatest(onPrev);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let start: { x: number; y: number; id: number } | null = null;
    /** One card per gesture: further movement is ignored until the pointer lifts. */
    let fired = false;

    function onDown(e: PointerEvent) {
      // Left button only for mouse; right/middle drags aren't navigation.
      if (e.pointerType === "mouse" && e.button !== 0) return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      fired = false;
    }
    function onMove(e: PointerEvent) {
      if (!start || fired || e.pointerId !== start.id) return;
      const dx = start.x - e.clientX;
      const dy = start.y - e.clientY;
      // Dominant axis wins, so a slightly diagonal swipe still reads as one.
      const delta = Math.abs(dy) >= Math.abs(dx) ? dy : dx;
      if (Math.abs(delta) < SWIPE_MIN) return;
      fired = true;
      if (delta > 0) next.current();
      else prev.current();
    }
    function onUp() {
      start = null;
      fired = false;
    }

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    // Without this a cancelled gesture leaves a stale start point behind.
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [ref, enabled, next, prev]);
}

/**
 * Wheel / trackpad nav on `ref` — the desktop counterpart to `useSwipeNav`, and
 * the reason both screens navigate identically on a laptop.
 *
 * Deltas accumulate per gesture (a pause resets them), so a mouse-wheel notch
 * advances instantly while trackpad momentum can't fire a second advance right
 * after the lock releases. `isLocked` reports the caller's in-flight lock so
 * momentum arriving mid-transition is dropped rather than queued. `enabled`
 * behaves exactly as in `useSwipeNav`.
 */
export function useWheelNav(
  ref: RefObject<HTMLElement | null>,
  onNext: () => void,
  onPrev: () => void,
  { enabled = true, isLocked }: { enabled?: boolean; isLocked?: () => boolean } = {},
) {
  const next = useLatest(onNext);
  const prev = useLatest(onPrev);
  const locked = useLatest(isLocked);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let accum = 0;
    let reset: number | undefined;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      window.clearTimeout(reset);
      reset = window.setTimeout(() => {
        accum = 0;
      }, 150);
      if (locked.current?.()) {
        accum = 0;
        return;
      }
      accum += e.deltaY;
      if (Math.abs(accum) < WHEEL_MIN) return;
      const delta = accum;
      accum = 0;
      if (delta > 0) next.current();
      else prev.current();
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(reset);
    };
  }, [ref, enabled, next, prev, locked]);
}
