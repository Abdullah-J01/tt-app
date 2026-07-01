import { NextResponse } from "next/server";
import { listStudybooks } from "@/lib/api";

/** GET /api/studybooks — example read endpoint (currently mock-backed). */
export async function GET() {
  const studybooks = await listStudybooks();
  return NextResponse.json({ studybooks });
}
