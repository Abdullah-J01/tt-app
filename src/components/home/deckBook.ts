import type { Studybook } from "@/types";

/**
 * The only book fields the landing-page decks render.
 *
 * Both decks are client components, so whatever the page hands them is
 * serialized into the RSC payload. A whole `Studybook` drags its `cards` along
 * — the majority of the bytes, and nothing either deck shows — so the page
 * projects to this first. Widen it when a deck genuinely renders a new field;
 * `toDeckBook` will fail to compile until you do.
 */
export type DeckBook = Pick<
  Studybook,
  "id" | "slug" | "title" | "synopsis" | "cover" | "priceEur" | "category" | "author"
>;

export const toDeckBook = ({
  id,
  slug,
  title,
  synopsis,
  cover,
  priceEur,
  category,
  author,
}: Studybook): DeckBook => ({ id, slug, title, synopsis, cover, priceEur, category, author });

/**
 * A book's own cover, falling back to demo art cycled by position.
 *
 * `cover` is optional and absent more often than it looks: an Open Library work
 * can have no `cover_id`, and the offline `MOCK_STUDYBOOKS` fallback (used
 * whenever OL is unreachable or rate-limits a cold start) carries no covers at
 * all. Without art to land on, a deck renders empty-looking cards — so every
 * deck resolves its image through this rather than reading `book.cover` raw.
 */
export const coverOrArt = (book: DeckBook, index: number, art: readonly string[]): string =>
  book.cover ?? art[index % art.length]!;
