import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProgress, saveProgress, type ProgressEntry } from "@/features/reading-progress/repository";

/** GET /api/progress — this user's reading progress across all studybooks. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: { code: "unauthenticated" } }, { status: 401 });
  }

  const result = await getProgress(session.user.email);
  if (!result.configured) {
    return NextResponse.json({ configured: false, progress: {} });
  }
  return NextResponse.json({ configured: true, progress: result.progress });
}

/** PUT /api/progress — upsert progress for one studybook. */
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: { code: "unauthenticated" } }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | (Partial<ProgressEntry> & { studybookSlug?: string })
    | null;
  if (
    !body?.studybookSlug ||
    typeof body.chapterIndex !== "number" ||
    typeof body.cardIndex !== "number" ||
    typeof body.globalIndex !== "number" ||
    typeof body.totalCards !== "number" ||
    typeof body.bookTitle !== "string" ||
    typeof body.bookAuthor !== "string" ||
    typeof body.subject !== "string" ||
    typeof body.grade !== "string"
  ) {
    return NextResponse.json({ error: { code: "invalid_body" } }, { status: 400 });
  }

  const result = await saveProgress(session.user.email, body.studybookSlug, {
    chapterIndex: body.chapterIndex,
    cardIndex: body.cardIndex,
    globalIndex: body.globalIndex,
    totalCards: body.totalCards,
    bookTitle: body.bookTitle,
    bookAuthor: body.bookAuthor,
    subject: body.subject,
    grade: body.grade,
    cover: body.cover,
    updatedAt: Date.now(),
  });
  return NextResponse.json({ ok: true, configured: result.configured });
}
