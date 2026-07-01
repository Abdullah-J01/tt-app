import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Clock, Layers } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
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

/** Studybook detail page — mirrors the TT ebook page (UI brief §6.3). */
export default async function StudybookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getStudybook(slug);
  if (!book) notFound();

  const related = (await listStudybooks()).filter((b) => b.id !== book.id).slice(0, 4);

  return (
    <>
      <TopNav />

      {/* Banner */}
      <section className="bg-lavender">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[240px_1fr]">
          {/* Cover */}
          <div className="bg-plum mx-auto aspect-[3/4] w-48 rounded-card shadow-soft md:mx-0 md:w-full" />

          {/* Meta */}
          <div>
            <nav className="flex items-center gap-1 text-sm text-muted">
              <span>Studybook</span>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-ink">{book.category}</span>
            </nav>

            <h1 className="mt-2 text-3xl font-bold">{book.title}</h1>
            <p className="mt-1 text-muted">
              {book.author} · {book.year}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href={`/studybook/${book.slug}/read`}>
                <Button size="lg">Start learning</Button>
              </Link>
              <Button size="lg" variant="secondary">
                Preview
              </Button>
              {book.priceEur != null && (
                <Pill className="bg-lavender">€{book.priceEur.toFixed(2)} to unlock all</Pill>
              )}
            </div>

            <div className="mt-4 flex gap-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Layers className="h-4 w-4" /> {book.cards.length} cards
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> ~{Math.max(1, Math.round(book.cards.length * 0.5))} min
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Synopsis + recommendations */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-lg font-bold">About this studybook</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink/90">{book.synopsis}</p>

        <h2 className="mt-12 text-lg font-bold">You may also like</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {related.map((b) => (
            <Link key={b.id} href={`/studybook/${b.slug}`} className="group">
              <div className="bg-plum aspect-[3/4] w-full rounded-card shadow-soft" />
              <p className="mt-2 line-clamp-2 text-sm font-semibold group-hover:text-violet">
                {b.title}
              </p>
              <p className="text-xs text-muted">{b.author}</p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
