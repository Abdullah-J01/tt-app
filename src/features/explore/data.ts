
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


export async function getCatalog(): Promise<{ books: Studybook[] }> {
  return { books: await listAllStudybooks() };
}

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
