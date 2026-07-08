import { notFound } from "next/navigation";
import { X } from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";
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
      {/* Close → history back (usually the detail page), so the browser's back
          button afterwards doesn't bounce into the reader again. Deep links
          with no history fall back to the detail page. */}
      <BackButton
        label=""
        icon={<X className="h-5 w-5" />}
        fallbackHref={`/studybook/${book.slug}`}
        className="absolute left-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-black/30 p-0 text-white backdrop-blur hover:bg-black/40"
      />

      <CardFeed items={items} />
    </div>
  );
}
