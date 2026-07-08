import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { BookOpen, ChevronRight, PlayCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { ResponsiveFooter } from "@/components/layout/ResponsiveFooter";
import { Pill } from "@/components/ui/Pill";
import { StudybookPreview, SaveButton } from "@/features/studybook";
import { SUBJECTS } from "@/config/subjects";
import { getStudybook, listStudybooks } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getStudybook(slug);
  const t = await getTranslations("app_studybook_slug_page");
  return { title: book?.title ?? t("metadataTitle") };
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

/** Studybook detail — mobile-first (UI brief §6.3). */
export default async function StudybookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getStudybook(slug);
  if (!book) notFound();

  const t = await getTranslations("app_studybook_slug_page");
  const gradeLabel = (g: string) =>
    g === "preschool"
      ? t("preschool")
      : g === "gymnasium"
        ? t("gymnasium")
        : t("grade", { grade: g });

  const related = (await listStudybooks()).filter((b) => b.id !== book.id).slice(0, 4);
  const subject = subjectName(book.subjectSlug);
  const minutes = Math.max(1, Math.round(book.cards.length * 0.5));
  const price = book.priceEur != null ? `€${book.priceEur.toFixed(2)}` : t("free");

  return (
    <>
      {/* Shared site header — the same one header used across the whole app. */}
      <Navbar />

      {/* Banner */}
      <section className="bg-lavender">
        {/* pt clears the fixed shared header (same spacer idea as the app shell). */}
        <div className="mx-auto max-w-5xl px-4 pt-24 pb-6 md:pt-28 md:pb-10">
          <nav className="text-muted flex items-center gap-1 text-xs">
            <Link href="/explore" className="hover:text-violet">
              {t("breadcrumb")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/explore/${book.subjectSlug}`}
              className="text-ink hover:text-violet font-medium"
            >
              {subject}
            </Link>
          </nav>

          {/* Mobile: cover + meta row, actions stacked full-width below.
              md+: cover spans both rows so the actions line up under the meta
              column instead of floating below the cover. */}
          <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-6 md:gap-x-8">
            {/* Cover */}
            <div className="bg-plum shadow-soft relative aspect-[3/4] w-24 overflow-hidden rounded-xl md:row-span-2 md:w-48">
              {book.cover ? (
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 96px, 192px"
                  className="object-cover"
                  priority
                />
              ) : (
                <span className="absolute inset-0 grid place-items-center font-mono text-[10px] tracking-[0.2em] text-white/40">
                  {t("bookCover")}
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="min-w-0">
              <h1 className="text-2xl leading-tight font-bold md:text-3xl">{book.title}</h1>
              <p className="text-muted mt-1 text-sm">
                {t("byAuthor", { author: book.author, year: book.year })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill className="bg-white">{subject}</Pill>
                <Pill className="bg-white">{gradeLabel(book.grade)}</Pill>
              </div>
              <div className="text-muted mt-3 flex items-center gap-1.5 text-sm">
                <BookOpen className="h-4 w-4" />
                {t("cardsMinutes", { count: book.cards.length, minutes })}
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-2 space-y-3 self-start md:col-span-1 md:col-start-2 md:max-w-md">
              <Link
                href={`/studybook/${book.slug}/read`}
                className="bg-violet hover:bg-violet-dark flex h-13 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {t("startLearning")}
                <Pill className="bg-white/20 text-white">{price}</Pill>
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/studybook/${book.slug}?preview=1`}
                  scroll={false}
                  className="border-hairline text-ink hover:bg-lavender flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors"
                >
                  <PlayCircle className="h-5 w-5" /> {t("preview")}
                </Link>
                <SaveButton book={book} full />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8">
        <h2 className="text-lg font-bold">{t("aboutTitle")}</h2>
        <p className="text-ink/80 mt-3 max-w-2xl leading-relaxed">{book.synopsis}</p>

        {/* Cards preview */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("cardsPreview")}</h2>
          <Link
            href={`/studybook/${book.slug}?preview=1`}
            scroll={false}
            className="text-violet flex items-center gap-0.5 text-sm font-semibold hover:underline"
          >
            {t("all", { count: book.cards.length })}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
          {book.cards.slice(0, 6).map((card, i) => (
            <Link
              key={card.id}
              href={`/studybook/${book.slug}?preview=1&card=${i}`}
              scroll={false}
              className="group w-32 shrink-0 snap-start md:w-40"
            >
              <div
                className={`shadow-soft flex aspect-[4/5] flex-col justify-end rounded-2xl p-3 text-white transition-transform group-hover:-translate-y-1 ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`}
              >
                <p className="line-clamp-4 text-sm leading-snug font-semibold">{card.heading}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* You may also like */}
        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("youMayAlsoLike")}</h2>
          <Link
            href="/explore"
            className="text-violet flex items-center gap-0.5 text-sm font-semibold hover:underline"
          >
            {t("more")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
          {related.map((b) => (
            <Link key={b.id} href={`/studybook/${b.slug}`} className="group">
              <div className="bg-plum shadow-soft relative aspect-[3/4] w-full overflow-hidden rounded-xl">
                {b.cover ? (
                  <Image
                    src={b.cover}
                    alt={b.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center font-mono text-[10px] tracking-[0.2em] text-white/40">
                    {t("cover")}
                  </span>
                )}
              </div>
              <p className="group-hover:text-violet mt-2 line-clamp-1 text-sm font-semibold">
                {b.title}
              </p>
              <p className="text-muted text-xs">{b.author}</p>
            </Link>
          ))}
        </div>
      </main>

      <Suspense fallback={null}>
        <StudybookPreview book={book} />
      </Suspense>

      <div className="hidden md:block">
        <ResponsiveFooter />
      </div>
    </>
  );
}
