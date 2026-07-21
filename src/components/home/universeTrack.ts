/**
 * Scroll-track geometry for `UniverseCarousel`, kept out of the component so its
 * skeleton can reserve *exactly* the height the real deck will occupy. The two
 * had already drifted apart once (the skeleton was still hardcoding a `vh` track
 * from an earlier formula), which shows up as a jump the moment the dynamic
 * import resolves.
 */

/** How many covers ride the spiral. */
export const COUNT = 5;
/** Scroll distance (px) per card swap while pinned. */
export const PER_CARD = 160;
/** Pinned scroll (px) at each end where the deck holds still on the first / last
 *  card. Without it the spin starts the instant the stage pins and the end card
 *  is already leaving as it lands — neither reads as "fully visible, then it moves". */
export const HOLD = 150;

/** Pinned scroll (px) for a full deck: hold, one scrub per swap, hold. */
export const PINNED_PX = (COUNT - 1) * PER_CARD + HOLD * 2;

/**
 * Track height: one viewport plus the pinned stretch.
 *
 * `svh`, not `vh`/`dvh`: Android's collapsing URL bar resizes the latter two
 * mid-scroll, and a track and its sticky child that resize out of step make the
 * deck jump. `svh` is fixed for the life of the page.
 */
export const trackHeight = (pinnedPx: number = PINNED_PX) => `calc(100svh + ${pinnedPx}px)`;

/** Air (px) left between the deck and the sections either side of it. */
export const EDGE = 32;

/**
 * Block margins that cancel the empty half-viewport above and below the deck.
 *
 * The sticky box is a full viewport tall — that is what lets the scroll mapping
 * span exactly the pinned stretch without a measured viewport height. The cost is
 * that the deck only fills the middle of it, so once the section unpins the rest
 * reads as a gap: measured 278px above and 321px below on a 915px phone, 385px
 * from the deck to the next section. These margins pull that back, keeping `EDGE`
 * of air. `min(0px, …)` so a stage taller than the viewport never *adds* space.
 *
 * Margins sit outside the border box, so this shifts where the track sits without
 * touching its height — the scroll mapping is unaffected.
 */
export const trackMargin = (stageCss: string = "var(--stage)") =>
  `min(0px, calc((${stageCss} + ${EDGE * 2}px - 100svh) / 2))`;
