import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { SubjectBooks } from "@/features/explore";
import { SUBJECTS } from "@/config/subjects";
import { listStudybooks } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}): Promise<Metadata> {
  const { subject } = await params;
  return { title: SUBJECTS.find((s) => s.slug === subject)?.name ?? "Subject" };
}

/** Studybooks filtered by subject (UI brief §6.4). */
export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  const meta = SUBJECTS.find((s) => s.slug === subject);
  if (!meta) notFound();

  const books = await listStudybooks({ subject });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-24 md:py-10 md:pb-12">
      <div className="flex items-center gap-2">
        <Link
          href="/explore"
          aria-label="Back to Explore"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink hover:bg-lavender"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">{meta.name}</h1>
      </div>

      <SubjectBooks books={books} />
    </div>
  );
}
