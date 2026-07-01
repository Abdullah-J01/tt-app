import Link from "next/link";
import { notFound } from "next/navigation";
import { SUBJECTS } from "@/config/subjects";
import { listStudybooks } from "@/lib/api";

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
      <h1 className="text-2xl font-bold">{meta.name}</h1>
      <p className="mt-1 text-muted">{meta.count.toLocaleString()} items</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {books.length === 0 && (
          <p className="col-span-full text-muted">No studybooks yet. (Placeholder)</p>
        )}
        {books.map((b) => (
          <Link key={b.id} href={`/studybook/${b.slug}`} className="group">
            <div className="bg-plum aspect-[3/4] w-full rounded-card shadow-soft" />
            <p className="mt-2 line-clamp-2 text-sm font-semibold group-hover:text-violet">
              {b.title}
            </p>
            <p className="text-xs text-muted">{b.author}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
