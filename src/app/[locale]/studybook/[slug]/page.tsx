import { Suspense } from "react";
import Link from "@/i18n/Link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { BookOpen, ChevronRight, PlayCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { ResponsiveFooter } from "@/components/layout/ResponsiveFooter";
import { CardRail } from "@/components/ui/CardRail";
import { Pill } from "@/components/ui/Pill";
import {
  StudybookPreview,
  SaveButton,
  StartLearningButton,
  GuestPrompt,
  isFreeBook,
} from "@/features/studybook";
import { getSubjectName } from "@/i18n/subjectName";
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

  // Ask for one small page of same-subject books rather than the whole
  // catalogue; +1 so we still have 4 after dropping the current book.
  const { items: subjectBooks } = await listStudybooks({ subject: book.subjectSlug, limit: 5 });
  const related = subjectBooks.filter((b) => b.id !== book.id).slice(0, 4);
  const subjectName = await getSubjectName();
  const subject = subjectName(book.subjectSlug);
  const minutes = Math.max(1, Math.round(book.cards.length * 0.5));
  const price = book.priceEur != null ? `€${book.priceEur.toFixed(2)}` : t("free");
  const free = isFreeBook(book);

  return (
    <>
      {/* Guests get the login popup over the opened book (dismiss → back).
          Free books skip it — guests read a couple of cards first, then sign in. */}
      <GuestPrompt free={free} />
      {/* Shared site header — the same one header used across the whole app. */}
      <Navbar />

      {/* Banner */}
      <section className="bg-lavender">
        {/* pt clears the fixed shared header (same spacer idea as the app shell). */}
        <div className="mx-auto max-w-5xl px-4 pt-[calc(env(safe-area-inset-top)+6rem)] pb-6 md:pt-[calc(env(safe-area-inset-top)+7rem)] md:pb-10">
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
                {t("chaptersMinutes", {
                  chapters: book.chapters.length,
                  cards: book.cards.length,
                  minutes,
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-2 space-y-3 self-start md:col-span-1 md:col-start-2 md:max-w-md">
              <StartLearningButton
                slug={book.slug}
                free={free}
                className="bg-violet hover:bg-violet-dark flex h-13 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {t("startLearning")}
                <Pill className="bg-white/20 text-white">{price}</Pill>
              </StartLearningButton>
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

        {/* Chapters — the unit you actually start learning from. Tapping one opens
            the reader on that chapter; "All" opens the swipeable chapter preview. */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("chapters")}</h2>
          <Link
            href={`/studybook/${book.slug}?preview=1`}
            scroll={false}
            className="text-violet flex items-center gap-0.5 text-sm font-semibold hover:underline"
          >
            {t("all", { count: book.chapters.length })}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {/* Horizontal carousel: 5 chapters fit one row from ~md up (5 × w-44 +
            gaps ≈ the max-w-5xl body), narrower viewports scroll it like any
            other rail (see CardRail). */}
        <CardRail itemWidth="w-40 sm:w-44" label={t("chapters")} className="mt-4">
          {book.chapters.map((chapter, i) => {
            const art = chapter.cover ?? book.cover;
            return (
              <StartLearningButton
                key={chapter.id}
                slug={book.slug}
                chapter={i}
                free={free}
                className="group block w-full text-left"
              >
                {/* Media — badges overlay it directly (this box is the
                    positioning context: top-left = chapter number, bottom-right
                    = card count), so they read as part of the artwork rather
                    than floating chrome around it. */}
                <div
                  className={`relative aspect-[3/4] w-full overflow-hidden rounded-2xl text-white ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`}
                >
                  {art ? (
                    <Image
                      src={art}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 160px, 176px"
                      className="object-cover opacity-90 transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center font-display text-2xl font-bold">
                      {i + 1}
                    </span>
                  )}
                  <span className="text-ink shadow-soft absolute top-5 left-2.5 grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-bold">
                    {i + 1}
                  </span>
                  <Pill
                    variant="ink"
                    className="absolute right-2 bottom-2 px-2 py-0.5 text-[10px]"
                  >
                    {t("chapterCards", { count: chapter.cards.length })}
                  </Pill>
                </div>
                <p className="group-hover:text-violet mt-2 line-clamp-1 text-sm font-semibold">
                  {chapter.title}
                </p>
                <p className="text-muted mt-1 line-clamp-2 text-xs leading-relaxed">
                  {chapter.summary}
                </p>
              </StartLearningButton>
            );
          })}
        </CardRail>

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
