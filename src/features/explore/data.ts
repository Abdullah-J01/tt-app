/**
 * Explore/catalog data helpers. Thin wrappers over the core data layer
 * (src/lib/api.ts) that shape studybooks for the Explore surfaces.
 *
 * Rule: ask for what the surface renders. A row that shows 6 covers requests 6
 * — it does not pull the catalogue and `.slice(0, 6)` the remainder away.
 */
import {
  listStudybooks,
  listAllStudybooks,
  searchStudybooks,
  searchStudybookCards,
} from "@/lib/api";
import { SUBJECTS, type Subject } from "@/config/subjects";
import { toStudybites, type Studybite } from "./studybites";
import type { Studybook } from "@/types";

export type { Studybite };
export { toStudybites };

/** Grouped search results (UI brief §6.4 — Subjects · Studybooks · Studybites). */
export interface SearchResults {
  subjects: Subject[];
  studybooks: Studybook[];
  studybites: Studybite[];
}

/** Newest studybooks first (Explore "Freshly added"). */
export async function getFreshlyAdded(limit = 6): Promise<Studybook[]> {
  // TODO(team): TT should own this ordering (`sort=newest`) so the page size is
  // the query rather than a slice of a larger fetch.
  const { items } = await listStudybooks({ limit });
  return [...items].sort((a, b) => b.year - a.year);
}

/**
 * Most-opened studybooks (Explore "Popular").
 * TODO(team): rank by real engagement from TT (`sort=popular`); mock uses card
 * count as a proxy.
 */
export async function getPopular(limit = 6): Promise<Studybook[]> {
  const { items } = await listStudybooks({ limit });
  return [...items].sort((a, b) => b.cards.length - a.cards.length);
}

/** Standalone cards for the Explore "Studybites for you" row. */
export async function getStudybites(limit = 6): Promise<Studybite[]> {
  // Cards-per-book is small, so one page of books yields more than enough bites.
  const { items } = await listStudybooks({ limit });
  return toStudybites(items).slice(0, limit);
}

/**
 * The full catalogue for the Explore landing.
 *
 * Returns books only — `studybites` are derived on the client from these same
 * books (see ./studybites), so returning both would serialize a second, fully
 * duplicated copy of every book for no added information.
 *
 * TODO(team): this is the one surface that still needs every row, because the
 * filter panel's facets and counts are computed client-side. Once TT exposes
 * facet counts + multi-facet queries, page this and filter server-side.
 */
export async function getCatalog(): Promise<{ books: Studybook[] }> {
  return { books: await listAllStudybooks() };
}

/**
 * Catalog search grouped into subjects, studybooks and studybites (UI brief §6.4).
 * The matching runs in TT (or over the mock catalogue in mock mode) — see
 * `searchStudybooks` / `searchStudybookCards`; this only groups the hits.
 *
 * Books and bites are two independent queries because they match different text:
 * a bite can hit on its card heading while its book's title/synopsis does not.
 * They run in parallel — neither depends on the other.
 */
export async function searchCatalog(query: string): Promise<SearchResults> {
  const q = query.trim().toLowerCase();
  if (!q) return { subjects: [], studybooks: [], studybites: [] };

  const [studybooks, cardHits] = await Promise.all([
    searchStudybooks(q),
    searchStudybookCards(q),
  ]);

  const subjects = SUBJECTS.filter((s) => s.name.toLowerCase().includes(q));
  // `cardHits` are whole books; keep only the cards that actually matched.
  const studybites = toStudybites(cardHits).filter((s) =>
    `${s.card.heading} ${s.card.body}`.toLowerCase().includes(q),
  );

  return { subjects, studybooks, studybites };
}
