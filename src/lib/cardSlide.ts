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
 * Chapter changes, unlike card changes, are ALWAYS horizontal — they're driven by
 * a horizontal swipe at every breakpoint, and the longer travel is what stops a
 * chapter jump reading as "just another card" on desktop, where cards already
 * slide sideways.
 */
export function chapterPair(dir: number): TransitionPair {
  const way = dir > 0 ? "left" : "right";
  return { outgoing: `anim-chapter-out-${way}`, incoming: `anim-chapter-in-${way}` };
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

export interface SwipeNavOptions {
  /**
   * Same trap as `useWheelNav`'s: a ref can't announce that its element mounted.
   * When the target renders conditionally — a closed overlay renders `null` — the
   * first effect run finds `ref.current === null` and binds nothing, and nothing
   * re-runs it once the element appears. Pass the same condition that renders the
   * element (e.g. StudybookPreview's `open`).
   */
  enabled?: boolean;
  /**
   * Ignore a horizontal-dominant drag entirely instead of treating it the same
   * as vertical. Off by default (either axis fires, whichever the finger moved
   * furthest along) — that's what a single-axis slideshow like StudybookPreview
   * wants. The reader turns this on: horizontal is reserved (chapter picker),
   * so a left/right swipe over a card should do nothing rather than double as
   * "next card".
   */
  verticalOnly?: boolean;
}

/**
 * Swipe on `ref`: up → next, down → prev, and left/right the same UNLESS
 * `verticalOnly` says to ignore them. The dominant axis wins, so a slightly
 * diagonal swipe still reads as one, in portrait and landscape alike.
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
 */
export function useSwipeNav(
  ref: RefObject<HTMLElement | null>,
  onNext: () => void,
  onPrev: () => void,
  { enabled = true, verticalOnly = false }: SwipeNavOptions = {},
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
      const vertical = Math.abs(dy) >= Math.abs(dx);
      if (!vertical && verticalOnly) return;
      const delta = vertical ? dy : dx;
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
  }, [ref, enabled, verticalOnly, next, prev]);
}

/** Pointer travel before a touch counts as a drag rather than a tap, in px. */
const DRAG_START_PX = 8;
/** How long the release animation (finish the slide, or spring back) runs. */
export const DRAG_SETTLE_MS = 280;
/** Flick: a release faster than this commits even before the distance threshold. */
const FLICK_VELOCITY = 0.5; // px/ms

/** A live drag gesture, for the caller to render finger-following copies from. */
export interface CardDrag {
  /** Pointer offset from the drag's start, px — negative when dragging up. */
  delta: number;
  /** Which neighbor the drag exposes: +1 next (dragging up), -1 prev. */
  dir: 1 | -1;
  /** Whether that neighbor may be shown — false rubber-bands instead. */
  reveal: boolean;
  /** Release animation in flight: finish the move, or spring back. */
  settling: "commit" | "cancel" | null;
}

export interface DragNavOptions {
  /** Same mount trap as `useSwipeNav`'s `enabled`. */
  enabled?: boolean;
  /** Caller's in-flight lock (e.g. a wheel/keyboard CSS turn) — blocks drag start. */
  isLocked?: () => boolean;
  /** Whether a neighbor exists in `dir` and may be revealed mid-drag. */
  canReveal: (dir: 1 | -1) => boolean;
  /** Commit the position change — called AFTER the settle animation, so the
   * caller must swap state without starting its own transition. */
  onCommit: (dir: 1 | -1) => void;
  /** A firm pull toward a neighbor that can't be revealed (gated card, end of
   * book) — fires alongside the spring-back so the caller can react (open the
   * login gate, finish the book). */
  onBlocked?: (dir: 1 | -1) => void;
}

/**
 * Finger-following drag nav — the TikTok/Reels gesture. Where `useSwipeNav`
 * fires a discrete step at a threshold, this reports the live drag so the
 * caller can move the outgoing card with the pointer and reveal the incoming
 * one behind it; on release it settles (commit past ~20% of the surface or on
 * a flick, spring back otherwise) and only then calls `onCommit`.
 *
 * Same load-bearing choices as `useSwipeNav`: Pointer events (one path for
 * touch, pen and mouse) and the element needs `touch-action: none`. Vertical
 * only by design — horizontal stays reserved for chapter affordances.
 *
 * Under reduced motion the drag still follows the finger (direct manipulation,
 * not an animation) but the release resolves instantly — no settle to wait on.
 */
export function useDragNav(
  ref: RefObject<HTMLElement | null>,
  options: DragNavOptions,
): CardDrag | null {
  const { enabled = true } = options;
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const opts = useLatest(options);
  const isReduced = useLatest(reduced);
  const [drag, setDrag] = useState<CardDrag | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node) return;
    // Re-bound so the narrowing survives into the hoisted handlers below.
    const el: HTMLElement = node;
    let start: { x: number; y: number; id: number } | null = null;
    let dragging = false;
    let settling = false;
    let settleTimer: number | undefined;
    let last = { y: 0, t: 0, vy: 0 };

    /** Rubber-band when there's nothing to reveal: heavy damping, short leash. */
    const damped = (dy: number) => Math.max(-72, Math.min(72, dy / 3));

    const settle = (phase: "commit" | "cancel", dir: 1 | -1, dy: number, reveal: boolean) => {
      if (isReduced.current) {
        if (phase === "commit") opts.current.onCommit(dir);
        setDrag(null);
        return;
      }
      settling = true;
      setDrag({ delta: reveal ? dy : damped(dy), dir, reveal, settling: phase });
      settleTimer = window.setTimeout(() => {
        settling = false;
        if (phase === "commit") opts.current.onCommit(dir);
        setDrag(null);
      }, DRAG_SETTLE_MS);
    };

    function onDown(e: PointerEvent) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (settling || opts.current.isLocked?.()) return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      dragging = false;
      last = { y: e.clientY, t: e.timeStamp, vy: 0 };
    }

    function onMove(e: PointerEvent) {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!dragging) {
        // Vertical intent only — a sideways or sub-slop move stays a tap.
        if (Math.abs(dy) < DRAG_START_PX || Math.abs(dy) < Math.abs(dx)) return;
        dragging = true;
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* pointer already gone — the up/cancel handlers still fire */
        }
      }
      const dt = e.timeStamp - last.t;
      if (dt > 0) last = { y: e.clientY, t: e.timeStamp, vy: (e.clientY - last.y) / dt };
      // Direction re-reads every move so a drag pulled back through its origin
      // flips cleanly to revealing the other neighbor.
      const dir: 1 | -1 = dy < 0 ? 1 : -1;
      const reveal = opts.current.canReveal(dir);
      setDrag({ delta: reveal ? dy : damped(dy), dir, reveal, settling: null });
    }

    function onUp(e: PointerEvent) {
      if (!start || e.pointerId !== start.id) return;
      const dy = e.clientY - start.y;
      const vy = last.vy;
      const wasDragging = dragging;
      start = null;
      dragging = false;
      if (!wasDragging) return;

      const dir: 1 | -1 = dy < 0 ? 1 : -1;
      const reveal = opts.current.canReveal(dir);
      const surface = el.clientHeight || 600;
      const flick =
        Math.abs(vy) > FLICK_VELOCITY && (vy < 0 ? 1 : -1) === dir && Math.abs(dy) > 24;
      const commit = reveal && (Math.abs(dy) > Math.max(70, surface * 0.2) || flick);
      if (!reveal && Math.abs(dy) > 70) opts.current.onBlocked?.(dir);
      settle(commit ? "commit" : "cancel", dir, dy, reveal);
    }

    function onCancel(e: PointerEvent) {
      if (!start || e.pointerId !== start.id) return;
      const dy = e.clientY - start.y;
      const wasDragging = dragging;
      start = null;
      dragging = false;
      if (!wasDragging) return;
      settle("cancel", dy < 0 ? 1 : -1, dy, opts.current.canReveal(dy < 0 ? 1 : -1));
    }

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onCancel);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
      window.clearTimeout(settleTimer);
      setDrag(null);
    };
  }, [ref, enabled, opts, isReduced]);

  return drag;
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
