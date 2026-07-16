/**
 * Studybite shaping — a single card surfaced on its own.
 *
 * Deliberately client-safe (no data-layer import): a studybite is a pure
 * function of the books we already sent, so the browser derives them from
 * `books` instead of us serializing a second, fully-duplicated copy of every
 * book into the RSC payload. Keep it dependency-free so both
 * `features/explore/data.ts` (server) and `ExploreView` (client) can import it.
 */
import type { Studybook } from "@/types";

/** A single card surfaced on its own (the "bite" in a Studybite row). */
export interface Studybite {
  card: Studybook["cards"][number];
  book: Studybook;
}

/** Flatten books into their individual cards. Pure — safe on either side. */
export function toStudybites(books: Studybook[]): Studybite[] {
  return books.flatMap((book) => book.cards.map((card) => ({ card, book })));
}
