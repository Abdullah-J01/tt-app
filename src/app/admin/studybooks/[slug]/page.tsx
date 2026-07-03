import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { CardEditor, StudybookForm, adminGetStudybook } from "@/features/admin";

interface EditStudybookPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EditStudybookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await adminGetStudybook(slug);
  return { title: book ? `Edit · ${book.title}` : "Studybook" };
}

/** Edit a studybook's metadata and manage its bite cards. */
export default async function EditStudybookPage({ params }: EditStudybookPageProps) {
  const { slug } = await params;
  const book = await adminGetStudybook(slug);
  if (!book) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-ink text-2xl font-bold">{book.title}</h1>
          <p className="text-muted mt-1 text-sm">
            {book.author} · {book.year}
          </p>
        </div>
        <Link
          href={`/studybook/${book.slug}`}
          className="text-violet flex items-center gap-1.5 text-sm font-semibold hover:underline"
        >
          View in app
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <StudybookForm book={book} />
      <CardEditor slug={book.slug} initialCards={book.cards} />
    </div>
  );
}
