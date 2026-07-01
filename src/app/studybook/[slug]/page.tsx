import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpen, ChevronRight, PlayCircle } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { BackButton } from "@/components/layout/BackButton";
import { StudybookPreview, ShareButton, SaveButton } from "@/features/studybook";
import { SUBJECTS } from "@/config/subjects";
import { getStudybook, listStudybooks } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getStudybook(slug);
  return { title: book?.title ?? "Studybook" };
}

const CARD_GRADIENTS = [
  "bg-gradient-to-br from-violet to-plum-1",
  "bg-gradient-to-br from-indigo-500 to-blue-800",
  "bg-gradient-to-br from-emerald-500 to-green-800",
  "bg-gradient-to-br from-amber-500 to-orange-700",
  "bg-gradient-to-br from-plum-2 to-plum-1",
];

function subjectName(slug: string) {
  return SUBJECTS.find((s) => s.slug === slug)?.name ?? slug;
}
function gradeLabel(g: string) {
  if (g === "preschool") return "Preschool";
  if (g === "gymnasium") return "Gymnasium";
  return `Grade ${g}`;
}

/** Studybook detail — mobile-first (UI brief §6.3). */
export default async function StudybookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getStudybook(slug);
  if (!book) notFound();

  const related = (await listStudybooks()).filter((b) => b.id !== book.id).slice(0, 4);
  const subject = subjectName(book.subjectSlug);
  const minutes = Math.max(1, Math.round(book.cards.length * 0.5));
  const price = book.priceEur != null ? `€${book.priceEur.toFixed(2)}` : "Free";

  return (
    <>
      {/* Desktop nav */}
      <div className="hidden md:block">
        <TopNav />
      </div>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
        <BackButton fallbackHref="/explore" label="" className="border border-hairline" />
        <div className="flex items-center gap-1">
          <ShareButton title={book.title} />
          <SaveButton />
        </div>
      </div>

      {/* Banner */}
      <section className="bg-lavender">
        <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
          <nav className="flex items-center gap-1 text-xs text-muted">
            <Link href="/explore" className="hover:text-violet">
              Studybook
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/explore/${book.subjectSlug}`} className="font-medium text-ink hover:text-violet">
              {subject}
            </Link>
          </nav>

          <div className="mt-3 flex gap-4 md:gap-8">
            {/* Cover */}
            <div className="bg-plum relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl shadow-soft md:w-48">
              {book.cover ? (
                <Image src={book.cover} alt={book.title} fill sizes="192px" className="object-cover" priority />
              ) : (
                <span className="absolute inset-0 grid place-items-center font-mono text-[10px] tracking-[0.2em] text-white/40">
                  book cover
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight md:text-3xl">{book.title}</h1>
              <p className="mt-1 text-sm text-muted">
                by {book.author} · {book.year}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill className="bg-white">{subject}</Pill>
                <Pill className="bg-white">{gradeLabel(book.grade)}</Pill>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-sm text-muted">
                <BookOpen className="h-4 w-4" />
                {book.cards.length} cards · ~{minutes} min
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3 md:max-w-md">
            <Link href={`/studybook/${book.slug}/read`} className="block">
              <Button size="lg" className="w-full">
                Start learning
                <Pill className="bg-white/20 text-white">{price}</Pill>
              </Button>
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/studybook/${book.slug}?preview=1`} scroll={false} className="block">
                <Button variant="secondary" className="w-full">
                  <PlayCircle className="h-5 w-5" /> Preview
                </Button>
              </Link>
              <SaveButton full />
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="text-lg font-bold">About this studybook</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink/80">{book.synopsis}</p>

        {/* Cards preview */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-bold">Cards preview</h2>
          <Link
            href={`/studybook/${book.slug}?preview=1`}
            scroll={false}
            className="flex items-center gap-0.5 text-sm font-semibold text-violet hover:underline"
          >
            All {book.cards.length}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {book.cards.slice(0, 6).map((card, i) => (
            <Link
              key={card.id}
              href={`/studybook/${book.slug}?preview=1&card=${i}`}
              scroll={false}
              className="group w-32 shrink-0"
            >
              <div
                className={`flex aspect-[4/5] flex-col justify-end rounded-2xl p-3 text-white shadow-soft transition-transform group-hover:-translate-y-1 ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`}
              >
                <p className="line-clamp-4 text-sm font-semibold leading-snug">{card.heading}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* You may also like */}
        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-lg font-bold">You may also like</h2>
          <Link
            href="/explore"
            className="flex items-center gap-0.5 text-sm font-semibold text-violet hover:underline"
          >
            More
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {related.map((b) => (
            <Link key={b.id} href={`/studybook/${b.slug}`} className="group">
              <div className="bg-plum relative aspect-[3/4] w-full overflow-hidden rounded-xl shadow-soft">
                {b.cover ? (
                  <Image src={b.cover} alt={b.title} fill sizes="(max-width: 768px) 50vw, 200px" className="object-cover" />
                ) : (
                  <span className="absolute inset-0 grid place-items-center font-mono text-[10px] tracking-[0.2em] text-white/40">
                    cover
                  </span>
                )}
              </div>
              <p className="mt-2 line-clamp-1 text-sm font-semibold group-hover:text-violet">{b.title}</p>
              <p className="text-xs text-muted">{b.author}</p>
            </Link>
          ))}
        </div>
      </main>

      <Suspense fallback={null}>
        <StudybookPreview book={book} />
      </Suspense>

      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
