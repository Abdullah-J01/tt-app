/**
 * Explore/catalog data helpers. Thin wrappers over the core data layer
 * (src/lib/api.ts) that shape studybooks for the Explore surfaces.
 */
import { listStudybooks } from "@/lib/api";
import { SUBJECTS, type Subject } from "@/config/subjects";
import type { Studybook } from "@/types";

/** A single card surfaced on its own (the "bite" in a Studybite row). */
export interface Studybite {
  card: Studybook["cards"][number];
  book: Studybook;
}

/** Grouped search results (UI brief §6.4 — Subjects · Studybooks · Studybites). */
export interface SearchResults {
  subjects: Subject[];
  studybooks: Studybook[];
  studybites: Studybite[];
}

function toStudybites(books: Studybook[]): Studybite[] {
  return books.flatMap((book) => book.cards.map((card) => ({ card, book })));
}

/** Newest studybooks first (Explore "Freshly added"). */
export async function getFreshlyAdded(limit = 6): Promise<Studybook[]> {
  const books = await listStudybooks();
  return [...books].sort((a, b) => b.year - a.year).slice(0, limit);
}

/**
 * Most-opened studybooks (Explore "Popular").
 * TODO(team): rank by real engagement from TT; mock uses card count as a proxy.
 */
export async function getPopular(limit = 6): Promise<Studybook[]> {
  const books = await listStudybooks();
  return [...books].sort((a, b) => b.cards.length - a.cards.length).slice(0, limit);
}

/** Standalone cards for the Explore "Studybites for you" row. */
export async function getStudybites(limit = 6): Promise<Studybite[]> {
  const books = await listStudybooks();
  return toStudybites(books).slice(0, limit);
}

/**
 * Catalog search grouped into subjects, studybooks and studybites (UI brief §6.4).
 * TODO(team): call ttApi.search() and group server-side once TT exposes it.
 */
export async function searchCatalog(query: string): Promise<SearchResults> {
  const q = query.trim().toLowerCase();
  if (!q) return { subjects: [], studybooks: [], studybites: [] };

  const books = await listStudybooks();
  const inText = (...parts: string[]) => parts.join(" ").toLowerCase().includes(q);

  const subjects = SUBJECTS.filter((s) => s.name.toLowerCase().includes(q));
  const studybooks = books.filter(
    (b) => inText(b.title, b.synopsis, b.category) || b.subjectSlug.includes(q),
  );
  const studybites = toStudybites(books).filter((s) => inText(s.card.heading, s.card.body));

  return { subjects, studybooks, studybites };
}
