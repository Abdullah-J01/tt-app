/**
 * App-facing data layer. Pages/components call these functions and never talk
 * to the network directly.
 *
 * Data comes from the TaskuTark (TT) backend via `ttApi`. When TT_API_BASE_URL
 * is not set (or USE_MOCK_DATA=1), we fall back to local mock data so the UI
 * still renders during design/dev. Explore-specific shaping lives in
 * src/features/explore/data.ts.
 */
import { ttApi } from "./tt-api";
import { getOpenLibraryCatalog, getOpenLibraryStudybook } from "./openlibrary";
import type { Studybook } from "@/types";

const USE_MOCK = process.env.USE_MOCK_DATA === "1" || !process.env.TT_API_BASE_URL;

/**
 * Dummy catalog used while there's no real content API. Sourced from Open Library
 * (see src/lib/openlibrary.ts), with a local mock fallback. Remove once TT is live.
 */
function mockCatalog(): Promise<Studybook[]> {
  return getOpenLibraryCatalog();
}

export interface FeedItem {
  card: Studybook["cards"][number];
  book: Studybook;
  index: number;
  total: number;
}

function toFeedItems(books: Studybook[]): FeedItem[] {
  return books.flatMap((book) =>
    book.cards.map((card, index) => ({ card, book, index, total: book.cards.length })),
  );
}

export async function listStudybooks(params?: {
  subject?: string;
  grade?: string;
}): Promise<Studybook[]> {
  if (USE_MOCK) {
    const all = await mockCatalog();
    return params?.subject ? all.filter((b) => b.subjectSlug === params.subject) : all;
  }
  return ttApi.listStudybooks(params);
}

export async function getStudybook(slug: string): Promise<Studybook | undefined> {
  if (USE_MOCK) return getOpenLibraryStudybook(slug);
  return ttApi.getStudybook(slug);
}

export async function getForYouFeed(): Promise<FeedItem[]> {
  // TODO(team): once TT exposes a personalized feed, call ttApi.getForYouFeed().
  if (USE_MOCK) return toFeedItems(await mockCatalog());
  return toFeedItems(await ttApi.getForYouFeed());
}
