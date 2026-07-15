import { NextResponse, type NextRequest } from "next/server";
import { getForYouFeed } from "@/lib/api";

/**
 * GET /api/feed?cursor=&books= — one page of the "For You" card feed.
 *
 * Running this on the server keeps the upstream fetches (Open Library today,
 * TT later) out of the browser: their `next.revalidate` cache applies here, so
 * the client pays one same-origin round trip instead of ~23 cross-origin ones.
 *
 * The feed is infinite, so it pages: the client passes back `nextCursor` from
 * the previous response rather than us shipping the whole catalogue at once.
 *
 * `books` (not `limit`) because a page is N studybooks flattened into their
 * cards — the response carries more `items` than `books`. See getForYouFeed.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") ?? undefined;
  const booksParam = Number(searchParams.get("books"));
  const booksPerPage =
    Number.isFinite(booksParam) && booksParam > 0 ? Math.min(booksParam, 25) : undefined;

  const { items, nextCursor } = await getForYouFeed(cursor, booksPerPage);
  return NextResponse.json({ items, nextCursor });
}
