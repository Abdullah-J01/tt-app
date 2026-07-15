import { NextResponse, type NextRequest } from "next/server";
import { listStudybooks } from "@/lib/api";

/**
 * GET /api/studybooks?subject=&grade=&page=&limit= — paged catalogue read.
 *
 * Paged rather than "everything": this endpoint is public, so an unbounded read
 * would let one request pull the entire TT catalogue once it's live.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pageParam = Number(searchParams.get("page"));
  const limitParam = Number(searchParams.get("limit"));

  const { items, total, nextCursor } = await listStudybooks({
    subject: searchParams.get("subject") ?? undefined,
    grade: searchParams.get("grade") ?? undefined,
    page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : undefined,
    limit: Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : undefined,
  });

  return NextResponse.json({ studybooks: items, total, nextCursor });
}
