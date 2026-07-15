/**
 * App-facing data layer. Pages/components call these functions and never talk
 * to the network directly.
 *
 * Data comes from the TaskuTark (TT) backend via `ttApi`. When TT_API_BASE_URL
 * is not set (or USE_MOCK_DATA=1), we fall back to local mock data so the UI
 * still renders during design/dev. Explore-specific shaping lives in
 * src/features/explore/data.ts.
 *
 * These signatures are the contract the UI is allowed to ask for, so they must
 * express what a *real* paged API can do — `page`/`limit`, a feed `cursor`, and
 * server-side `search`. Callers must request only what they render: a bare
 * "fetch the whole catalogue and slice it in JS" works against 250 mock books
 * and falls over against a real one. The mock branch emulates the same paging
 * so both branches behave identically.
 */
import { cache } from "react";
import { ttApi } from "./tt-api";
import { getOpenLibraryCatalog, getOpenLibraryStudybook } from "./openlibrary";
import { getLocale } from "@/i18n/server";
import type { Locale } from "@/i18n/config";
import type { Studybook } from "@/types";

const USE_MOCK = process.env.USE_MOCK_DATA === "1" || !process.env.TT_API_BASE_URL;

/** Page size used when a caller doesn't specify one. */
export const DEFAULT_PAGE_SIZE = 24;

/**
 * Dummy catalog used while there's no real content API. Sourced from Open Library
 * (see src/lib/openlibrary.ts), with a local mock fallback. Its synthesized text
 * (synopsis, cards, category) is localized to the request locale; real book
 * titles/authors/covers stay as-is. Remove once TT is live.
 */
function mockCatalog(locale: Locale): Promise<Studybook[]> {
  return getOpenLibraryCatalog(locale);
}

export interface FeedItem {
  card: Studybook["cards"][number];
  book: Studybook;
  index: number;
  total: number;
}

/** One page of results plus the paging metadata a caller needs to ask for more. */
export interface Page<T> {
  items: T[];
  /** Total matching rows, when the source knows it (mock always does). */
  total?: number;
  /** Opaque cursor for the next page; undefined when there is no next page. */
  nextCursor?: string;
}

export interface ListParams {
  subject?: string;
  grade?: string;
  page?: number;
  limit?: number;
}

function toFeedItems(books: Studybook[]): FeedItem[] {
  return books.flatMap((book) =>
    book.cards.map((card, index) => ({ card, book, index, total: book.cards.length })),
  );
}

/** Mock-side paging so the mock branch behaves like a real paged endpoint. */
function paginate<T>(rows: T[], page = 1, limit = DEFAULT_PAGE_SIZE): Page<T> {
  const start = Math.max(0, (page - 1) * limit);
  const items = rows.slice(start, start + limit);
  return {
    items,
    total: rows.length,
    nextCursor: start + limit < rows.length ? String(page + 1) : undefined,
  };
}

/**
 * The mock catalogue for the request locale, deduped per request.
 *
 * `cache()` is what keeps this honest: several surfaces read the catalogue in a
 * single render (page + generateMetadata), and without dedup each one is a
 * separate upstream round trip once TT is live.
 */
const requestCatalog = cache(async (): Promise<Studybook[]> => mockCatalog(await getLocale()));

function matchesParams(book: Studybook, params?: ListParams): boolean {
  if (params?.subject && book.subjectSlug !== params.subject) return false;
  if (params?.grade && params.grade !== "all" && book.grade !== params.grade) return false;
  return true;
}

/**
 * One page of studybooks. Prefer this over {@link listAllStudybooks} — pass the
 * `limit` you actually render so the query stays bounded as the catalogue grows.
 */
export const listStudybooks = cache(async (params?: ListParams): Promise<Page<Studybook>> => {
  if (USE_MOCK) {
    const all = await requestCatalog();
    return paginate(
      all.filter((b) => matchesParams(b, params)),
      params?.page,
      params?.limit,
    );
  }
  const items = await ttApi.listStudybooks(params);
  return { items, nextCursor: items.length === (params?.limit ?? DEFAULT_PAGE_SIZE) ? String((params?.page ?? 1) + 1) : undefined };
});

/**
 * The entire catalogue, unpaged.
 *
 * Only for surfaces that genuinely need every row (today: Explore's client-side
 * faceting and the admin seed). Every other caller wants {@link listStudybooks}.
 *
 * TODO(team): once TT exposes facet counts + multi-facet queries
 * (docs/TT_API_ENDPOINTS.md), Explore should filter server-side and this should
 * be deleted — it cannot scale to a real catalogue.
 */
export const listAllStudybooks = cache(async (params?: ListParams): Promise<Studybook[]> => {
  if (USE_MOCK) {
    const all = await requestCatalog();
    return all.filter((b) => matchesParams(b, params));
  }
  return ttApi.listStudybooks(params);
});

export const getStudybook = cache(async (slug: string): Promise<Studybook | undefined> => {
  if (USE_MOCK) return getOpenLibraryStudybook(slug, await getLocale());
  return ttApi.getStudybook(slug);
});

/**
 * Server-side search over book-level text (title, author, synopsis, category).
 * The mock branch filters in JS because Open Library has no search we can shape;
 * the real branch delegates to TT so the match never runs in our process.
 */
export const searchStudybooks = cache(
  async (query: string, limit?: number): Promise<Studybook[]> => {
    const q = query.trim();
    if (!q) return [];
    if (USE_MOCK) {
      const needle = q.toLowerCase();
      const all = await requestCatalog();
      const hits = all.filter((b) =>
        [b.title, b.author, b.synopsis, b.category, b.subjectSlug]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      );
      return limit ? hits.slice(0, limit) : hits;
    }
    const hits = await ttApi.search(q, "studybook");
    return limit ? hits.slice(0, limit) : hits;
  },
);

/**
 * Search over *card* text, returning the books that carry the matching cards.
 *
 * Separate from {@link searchStudybooks} on purpose: a card can match on its own
 * heading/body while its book's title and synopsis do not (e.g. "One thing worth
 * remembering" inside "Pride and Prejudice"). Folding this into the book search
 * would silently drop those bites from the results.
 */
export const searchStudybookCards = cache(async (query: string): Promise<Studybook[]> => {
  const q = query.trim();
  if (!q) return [];
  if (USE_MOCK) {
    const needle = q.toLowerCase();
    const all = await requestCatalog();
    return all.filter((b) =>
      b.cards.some((c) => `${c.heading} ${c.body}`.toLowerCase().includes(needle)),
    );
  }
  return ttApi.search(q, "bite");
});

/**
 * One page of the "For You" feed. `cursor` is opaque and comes from the previous
 * page's `nextCursor` — the feed is infinite, so it must never load the whole
 * catalogue up front.
 *
 * `booksPerPage` counts *studybooks*, not cards: TT's feed returns studybooks
 * (`ttApi.getForYouFeed`) which we flatten into their cards, so a page of N
 * books yields however many cards those books carry. Counting books here is what
 * keeps the mock honest about the real contract.
 *
 * No `total`: the number of cards behind the cursor isn't knowable without
 * walking the whole feed, and reporting a book count next to a card list would
 * be a lie. The feed is infinite — callers use `nextCursor`, not a total.
 */
export const getForYouFeed = cache(
  async (cursor?: string, booksPerPage = 8): Promise<Page<FeedItem>> => {
    if (USE_MOCK) {
      const page = Number(cursor ?? "1") || 1;
      const all = await requestCatalog();
      const books = paginate(all, page, booksPerPage);
      return { items: toFeedItems(books.items), nextCursor: books.nextCursor };
    }
    const books = await ttApi.getForYouFeed(cursor);
    return {
      items: toFeedItems(books),
      nextCursor:
        books.length === booksPerPage ? String((Number(cursor ?? "1") || 1) + 1) : undefined,
    };
  },
);
