import gsap from "gsap";

/**
 * Transient Instagram-style like hearts for the feed. Hand-drawn SVG (not an
 * icon font) so the fill gradient is ours. Hearts are appended to <body> with
 * fixed positioning at screen coordinates measured per call — they overlay
 * everything, are never clipped by card overflow, and stay correct at any
 * breakpoint (the Like button lives inside the card on mobile but outside it
 * on lg+, so its live rect is the only reliable flight target).
 */

/** Heart on a 24×24 grid: two cubic lobes meeting at the bottom tip. */
const HEART_PATH =
  "M12 21 C10.4 19.5 4.1 15.3 2.7 10.9 C1.8 8 3.5 4.7 6.6 4.2 " +
  "C8.7 3.9 10.8 4.9 12 6.6 C13.2 4.9 15.3 3.9 17.4 4.2 " +
  "C20.5 4.7 22.2 8 21.3 10.9 C19.9 15.3 13.6 19.5 12 21 Z";

let gradSeq = 0;

function heartSvg(size: number): string {
  // Unique gradient id per heart — several can be on screen at once.
  const gid = `tt-like-grad-${++gradSeq}`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 34 34" aria-hidden="true">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fb7185"/>
      <stop offset="1" stop-color="#e11d48"/>
    </linearGradient>
  </defs>
  <path d="${HEART_PATH}" fill="url(#${gid})"/>
</svg>`;
}

function spawnHeart(x: number, y: number, size: number): HTMLSpanElement {
  const el = document.createElement("span");
  el.innerHTML = heartSvg(size);
  Object.assign(el.style, {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    lineHeight: "0",
    pointerEvents: "none",
    willChange: "transform, opacity",
    zIndex: "9999",
    filter: "drop-shadow(0 2px 6px rgba(225, 29, 72, 0.35))",
  } as Partial<CSSStyleDeclaration>);
  document.body.appendChild(el);
  return el;
}

const reducedMotion = () =>
  typeof window === "undefined" ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Tapping the Like button: a small heart escapes upward and fades away. */
export function floatHeart(origin: HTMLElement | null): void {
  if (!origin || reducedMotion()) return;
  const r = origin.getBoundingClientRect();
  const el = spawnHeart(r.left + r.width / 2, r.top + r.height / 2, 44);
  gsap.fromTo(
    el,
    { xPercent: -50, yPercent: -50, scale: 0.5, opacity: 0.9 },
    {
      y: -72,
      x: gsap.utils.random(-10, 10),
      scale: 1.15,
      opacity: 0,
      duration: 0.9,
      ease: "power1.out",
      onComplete: () => el.remove(),
    },
  );
}

/**
 * Double-tap like: a heart pops in at the tap point (elastic, like Instagram),
 * holds a beat, then flies into the Like button — shrinking to the size of the
 * button's own heart as it lands.
 */
export function flyHeartToButton(x: number, y: number, target: HTMLElement | null): void {
  if (!target || reducedMotion()) return;
  const POP = 72;
  const ICON = 19; // Heart icon size inside the Like button
  const t = target.getBoundingClientRect();
  const el = spawnHeart(x, y, POP);
  gsap
    .timeline({ onComplete: () => el.remove() })
    .fromTo(
      el,
      { xPercent: -50, yPercent: -50, scale: 0, rotation: -12, opacity: 1 },
      { scale: 1, rotation: 0, duration: 0.4, ease: "elastic.out(1.1, 0.55)" },
    )
    .to(
      el,
      {
        x: t.left + t.width / 2 - x,
        y: t.top + t.height / 2 - y,
        scale: ICON / POP,
        duration: 0.45,
        ease: "power2.in",
      },
      "+=0.15",
    )
    .to(el, { opacity: 0, duration: 0.12 }, "-=0.08");
}
