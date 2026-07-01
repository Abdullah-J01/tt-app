/**
 * App-facing data layer. Pages/components call these functions and never talk
 * to the network directly.
 *
 * Data comes from the TaskuTark (TT) backend via `ttApi`. When TT_API_BASE_URL
 * is not set (or USE_MOCK_DATA=1), we fall back to local mock data so the UI
 * still renders during design/dev.
 */
import { ttApi } from "./tt-api";
import { MOCK_STUDYBOOKS, getStudybookBySlug } from "./mock-data";
import type { Studybook } from "@/types";

const USE_MOCK = process.env.USE_MOCK_DATA === "1" || !process.env.TT_API_BASE_URL;

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
    return params?.subject
      ? MOCK_STUDYBOOKS.filter((b) => b.subjectSlug === params.subject)
      : MOCK_STUDYBOOKS;
  }
  return ttApi.listStudybooks(params);
}

export async function getStudybook(slug: string): Promise<Studybook | undefined> {
  if (USE_MOCK) return getStudybookBySlug(slug);
  return ttApi.getStudybook(slug);
}

export async function getForYouFeed(): Promise<FeedItem[]> {
  // TODO(team): once TT exposes a personalized feed, call ttApi.getForYouFeed().
  if (USE_MOCK) return toFeedItems(MOCK_STUDYBOOKS);
  return toFeedItems(await ttApi.getForYouFeed());
}
