import { NextResponse } from "next/server";
import { getForYouFeed } from "@/lib/api";

/**
 * GET /api/feed — the "For You" card feed (currently mock-backed).
 *
 * Running this on the server keeps the upstream fetches (Open Library today,
 * TT later) out of the browser: their `next.revalidate` cache applies here, so
 * the client pays one same-origin round trip instead of ~23 cross-origin ones.
 */
export async function GET() {
  const items = await getForYouFeed();
  return NextResponse.json({ items });
}
