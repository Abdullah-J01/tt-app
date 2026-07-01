import Link from "next/link";
import { notFound } from "next/navigation";
import { X } from "lucide-react";
import { CardFeed } from "@/components/feed/CardFeed";
import { getStudybook } from "@/lib/api";

/** Studybook reader — the feed variant scoped to one book (UI brief §4 + §6.3). */
export default async function ReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getStudybook(slug);
  if (!book) notFound();

  const items = book.cards.map((card, index) => ({
    card,
    book,
    index,
    total: book.cards.length,
  }));

  return (
    <div className="relative mx-auto max-w-md md:max-w-lg">
      {/* Close → back to detail */}
      <Link
        href={`/studybook/${book.slug}`}
        aria-label="Close reader"
        className="absolute left-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-black/30 text-white backdrop-blur"
      >
        <X className="h-5 w-5" />
      </Link>

      <CardFeed items={items} />
    </div>
  );
}
