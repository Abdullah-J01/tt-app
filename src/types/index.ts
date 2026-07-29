/** Domain types shared across the app. TT API responses are mapped to these in src/lib/tt-api.ts. */

export interface StudyCard {
  id: string;
  /** One-line insight (the "bite"). */
  heading: string;
  /**
   * Supporting lines. Deliberately bounded — a card never scrolls, so the body
   * must fit the card at every viewport (see CARD_BODY_MAX in src/lib/chapters.ts).
   */
  body: string;
  /** Optional per-card artwork. Cards without one just flow as text. */
  image?: string;
}

/**
 * A named run of cards inside a studybook — the unit the reader navigates
 * horizontally (swipe left → next chapter) and the unit the detail page and the
 * preview overlay both list.
 */
export interface Chapter {
  id: string;
  /** 0-based position in the book, so callers don't have to indexOf(). */
  index: number;
  title: string;
  /** One or two lines, shown on the chapter tiles and the preview slides. */
  summary: string;
  /** Optional chapter artwork (falls back to the book cover where it matters). */
  cover?: string;
  cards: StudyCard[];
}

export interface Studybook {
  id: string;
  slug: string;
  title: string;
  author: string;
  year: number;
  subjectSlug: string;
  grade: string;
  category: string;
  synopsis: string;
  /** Path/URL to cover art. */
  cover?: string;
  /** Price in EUR to unlock, if gated. */
  priceEur?: number;
  chapters: Chapter[];
  /**
   * Every card in the book, in chapter order.
   *
   * Derived from {@link chapters} — always build it with `flattenChapters()`
   * (src/lib/chapters.ts) rather than assembling it by hand, so the two can't
   * drift. It exists because plenty of surfaces only care about "how much
   * content is in here" (explore sorting, card counts, card search) and have no
   * business knowing about chapters.
   */
  cards: StudyCard[];
}
