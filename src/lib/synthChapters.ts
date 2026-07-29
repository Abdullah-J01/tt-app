/**
 * TEMPORARY chapter/card generator for the dummy catalog.
 *
 * No book API returns bite-sized cards, so we synthesize them (see
 * src/lib/openlibrary.ts). This module owns the *shape* of that content —
 * chapter count, cards per chapter, body lengths, which cards carry artwork —
 * while the actual copy is injected as `SynthCopy` so the caller decides the
 * language. That's what lets the localized Open Library catalog and the plain
 * English offline fallback share one code path.
 *
 * Everything here is a pure function of `seed`. Nothing random: the catalog is
 * cached per locale and rendered on the server, so a card that changed between
 * two renders would hydrate mismatched.
 *
 * TODO(team): delete once TT serves real chapters + cards.
 */
import {
  CARDS_PER_CHAPTER,
  CARD_BODY_BUDGET,
  CHAPTERS_PER_BOOK,
  clampBody,
  type BodyTier,
} from "./chapters";
import type { Chapter } from "@/types";

/**
 * Localized copy pools. The caller resolves these from its own namespace (with
 * `{title}` / `{subject}` already interpolated), so this module never touches
 * i18n and stays usable from the non-localized fallback data.
 */
export interface SynthCopy {
  /** One title per chapter; index-aligned with the chapters produced. */
  chapterTitles: string[];
  /** One summary per chapter, index-aligned with `chapterTitles`. */
  chapterSummaries: string[];
  /** Card headings, cycled. */
  headings: string[];
  /** Body sentences, combined 1–3 at a time to hit each length tier. */
  sentences: string[];
}

/**
 * Length mix, indexed by card position. Roughly 2/5 short, 2/5 medium, 1/5 long,
 * so every chapter contains all three and no two neighbours match. Cards are
 * built to fit the card surface — a card never scrolls (see src/lib/chapters.ts).
 */
const TIERS: BodyTier[] = ["short", "medium", "long", "short", "medium"];

/**
 * Sentences combined for each tier. Tuned against the real copy pools to spread
 * bodies across ~50–300 characters, so a chapter visibly mixes one-line bites
 * with denser cards. `buildBody` clamps the result to the tier's budget, so a
 * longer pool can only shorten a card, never overflow one.
 */
const SENTENCES_PER_TIER: Record<BodyTier, number> = { short: 1, medium: 2, long: 4 };

/** Every third card carries artwork, so the mix of "with image" / "text only" is visible. */
const IMAGE_EVERY = 3;

/**
 * Stable numeric seed for a string id. Shared by every generator here so the
 * same book always produces the same grade, price and content.
 */
export function seedFrom(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Pick from a pool with a stride that's coprime with typical pool sizes. */
function pick<T>(pool: T[], n: number): T {
  return pool[((n % pool.length) + pool.length) % pool.length]!;
}

/** Build one body of the given tier by joining consecutive sentences. */
function buildBody(copy: SynthCopy, tier: BodyTier, n: number): string {
  const parts: string[] = [];
  for (let i = 0; i < SENTENCES_PER_TIER[tier]; i++) parts.push(pick(copy.sentences, n + i * 5));
  return clampBody(parts.join(" "), CARD_BODY_BUDGET[tier]);
}

/**
 * `CHAPTERS_PER_BOOK` chapters of `CARDS_PER_CHAPTER` cards, deterministic in
 * `seed`. `cover` (the book's artwork) becomes the chapter tile image and the
 * media on the cards that carry one — it's the only image the dummy catalog has.
 */
export function synthChapters(
  bookId: string,
  seed: number,
  copy: SynthCopy,
  cover?: string,
): Chapter[] {
  return Array.from({ length: CHAPTERS_PER_BOOK }, (_, index) => {
    const cards = Array.from({ length: CARDS_PER_CHAPTER }, (_, i) => {
      // Mixed with the chapter so the same card position reads differently from
      // one chapter to the next.
      const n = seed + index * 11 + i * 3;
      const tier = pick(TIERS, i + index);
      return {
        id: `${bookId}-ch${index + 1}-c${i + 1}`,
        heading: pick(copy.headings, n),
        body: buildBody(copy, tier, n),
        ...(cover && (i + index) % IMAGE_EVERY === 0 ? { image: cover } : {}),
      };
    });

    return {
      id: `${bookId}-ch${index + 1}`,
      index,
      title: pick(copy.chapterTitles, index),
      summary: pick(copy.chapterSummaries, index),
      cover,
      cards,
    };
  });
}
