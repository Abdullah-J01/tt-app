/**
 * Chapter helpers shared by the reader, the preview overlay and the detail page.
 *
 * A studybook is a list of chapters; a chapter is a list of cards. `Studybook.cards`
 * is the flattened view of the same content, kept for the many surfaces that only
 * need "how much is in here" (explore sorting, counts, card search).
 *
 * The length budget below is the load-bearing rule: a card NEVER scrolls. The
 * reader's card is `touch-none` with absolutely-positioned content precisely so a
 * swipe can't be stolen by a scroll container, which means anything that doesn't
 * fit is simply unreadable. Content is therefore generated inside the budget and
 * clamped at render as a backstop for real TT data we don't control.
 */
import type { Chapter, StudyCard, Studybook } from "@/types";

/** Chapters per generated mock book. Real books get whatever TT returns. */
export const CHAPTERS_PER_BOOK = 5;

/** Cards per generated mock chapter. */
export const CARDS_PER_CHAPTER = 25;

/**
 * Body length budget, in characters, per tier. Each number is what that tier's
 * type scale can show at the smallest supported viewport (~360×640) without
 * clipping — heading, optional image and body together, measured against the
 * `TIER_STYLES` sizes in StudybookReader. Raising a tier here without shrinking
 * its type/media there is how a card starts overflowing, so the two move as a
 * pair. Sized to *fill* the card: a body well under its tier's budget leaves the
 * dead space above and below that the centring can only spread around.
 */
export const CARD_BODY_BUDGET = { short: 320, medium: 470, long: 610 } as const;

export type BodyTier = keyof typeof CARD_BODY_BUDGET;

/** Hard ceiling — no card body may exceed this, whatever its source. */
export const CARD_BODY_MAX = CARD_BODY_BUDGET.long;

/**
 * Which size bucket a body falls into. Drives the reader's type scale so a short
 * bite fills the card instead of floating in the middle of it, and a long one
 * still fits.
 */
export function bodyTier(body: string): BodyTier {
  if (body.length <= CARD_BODY_BUDGET.short) return "short";
  if (body.length <= CARD_BODY_BUDGET.medium) return "medium";
  return "long";
}

/**
 * Trim to `max` on a word boundary. Used both when generating mock bodies and as
 * the backstop for TT-authored cards, so an over-long body degrades to a clean
 * sentence rather than a clipped card.
 */
export function clampBody(body: string, max: number = CARD_BODY_MAX): string {
  const text = body.trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(" "));
  return `${cut
    .slice(0, stop > max * 0.6 ? stop : max)
    .trimEnd()
    .replace(/[,;:]$/, "")}…`;
}

/** Every card in the book, in chapter order — the value for `Studybook.cards`. */
export function flattenChapters(chapters: Chapter[]): StudyCard[] {
  return chapters.flatMap((c) => c.cards);
}

/** Clamp a chapter index into the book. Books always have at least one chapter. */
export function clampChapter(book: Pick<Studybook, "chapters">, index: number): number {
  return Math.max(0, Math.min(book.chapters.length - 1, index));
}

/**
 * Parse a `?chapter=` search param (1-based in the URL, 0-based in state) into a
 * valid chapter index. Anything unparseable falls back to the first chapter.
 */
export function chapterFromParam(book: Pick<Studybook, "chapters">, raw: string | null): number {
  const n = Number(raw);
  if (!raw || !Number.isFinite(n)) return 0;
  return clampChapter(book, Math.trunc(n) - 1);
}

/** The `?chapter=` value for a 0-based index (1-based, so URLs read naturally). */
export function chapterParam(index: number): string {
  return String(index + 1);
}

/**
 * Parse a `?card=` search param (1-based in the URL) into a valid card index
 * *within* `chapter`. Same convention as `?chapter=`; together they let Home's
 * "Continue" reopen a book exactly where the reader was left.
 */
export function cardFromParam(chapter: Chapter | undefined, raw: string | null): number {
  const n = Number(raw);
  if (!raw || !chapter || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(chapter.cards.length - 1, Math.trunc(n) - 1));
}

/** The `?card=` value for a 0-based index. */
export function cardParam(index: number): string {
  return String(index + 1);
}

/**
 * Cards a surface should take from a book when it wants a *taste* rather than the
 * whole thing — one card per chapter. The "For You" feed uses this: flattening
 * every card would put 100+ items per book into an infinite feed and drown every
 * other book on the page.
 */
export function sampleCards(book: Pick<Studybook, "chapters">): StudyCard[] {
  return book.chapters.flatMap((c) => (c.cards[0] ? [c.cards[0]] : []));
}
