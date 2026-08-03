"use client";

import { useMemo } from "react";
import { useTranslations } from "@/i18n/client";
import Link from "@/i18n/Link";
import { Button } from "@/components/ui/Button";
import { cardParam, chapterParam } from "@/lib/chapters";
import { CoverCard } from "@/features/explore/components/CoverCard";
import { useLibrary } from "@/features/library/useLibrary";
import { useReadingProgress } from "@/features/reading-progress/useReadingProgress";
import { BookRail } from "./BookRail";
import { BookPreviewTile } from "./BookPreviewTile";
import type { HomeData } from "../data";

const LIBRARY_PREVIEW_SIZE = 6;

/**
 * How far into the book, as a percentage. Tolerates entries stored before
 * `globalIndex`/`totalCards` existed — a half-written schema in someone's
 * localStorage must not render a `NaN%` bar.
 */
function pctRead(entry: { globalIndex?: number; totalCards?: number }): number {
  const { globalIndex, totalCards } = entry;
  if (typeof globalIndex !== "number" || !totalCards) return 0;
  return Math.min(100, Math.round(((globalIndex + 1) / totalCards) * 100));
}

export function HomeView({ popular, freshlyAdded }: HomeData) {
  const t = useTranslations("app_app_home_page");
  const { progress } = useReadingProgress();
  const { books: savedBooks } = useLibrary();

  /**
   * Priority order Continue → Your Library → Popular → New: once a book has
   * shown up in an earlier row, it's dropped from every later one, so the
   * same title never repeats on one screen.
   */
  const { continueItems, libraryItems, popularItems, newItems } = useMemo(() => {
    const shown = new Set<string>();

    const continueItems = Object.entries(progress)
      .map(([slug, entry]) => ({ slug, ...entry }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    continueItems.forEach((c) => shown.add(c.slug));

    const libraryItems = savedBooks
      .filter((b) => !shown.has(b.bookSlug))
      .slice(0, LIBRARY_PREVIEW_SIZE);
    libraryItems.forEach((b) => shown.add(b.bookSlug));

    const popularItems = popular.filter((b) => !shown.has(b.slug));
    popularItems.forEach((b) => shown.add(b.slug));

    const newItems = freshlyAdded.filter((b) => !shown.has(b.slug));

    return { continueItems, libraryItems, popularItems, newItems };
  }, [progress, savedBooks, popular, freshlyAdded]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-6 md:py-10 lg:pb-12 lg:px-8">
      <h1 className="text-ink text-2xl font-bold tracking-tight">{t("title")}</h1>

      <div className="mt-8 flex flex-col gap-10">
        <BookRail
          title={t("continueTitle")}
          items={continueItems}
          itemKey={(c) => c.slug}
          renderItem={(c) => (
            <BookPreviewTile
              slug={c.slug}
              title={c.bookTitle}
              author={c.bookAuthor}
              subjectSlug={c.subject}
              cover={c.cover}
              progressPct={pctRead(c)}
              href={`/studybook/${c.slug}/read?chapter=${chapterParam(c.chapterIndex)}&card=${cardParam(c.cardIndex ?? 0)}`}
            />
          )}
          emptyTitle={t("continueEmptyTitle")}
          emptyDescription={t("continueEmptyDescription")}
          emptyAction={
            <Link href="/explore">
              <Button size="sm">{t("continueEmptyCta")}</Button>
            </Link>
          }
        />

        <BookRail
          title={t("libraryTitle")}
          seeAllHref="/library"
          seeAllLabel={t("seeAll")}
          items={libraryItems}
          itemKey={(b) => b.bookSlug}
          renderItem={(b) => (
            <BookPreviewTile
              slug={b.bookSlug}
              title={b.bookTitle}
              author={b.bookAuthor}
              subjectSlug={b.subject}
              cover={b.cover}
            />
          )}
          emptyTitle={t("libraryEmptyTitle")}
          emptyDescription={t("libraryEmptyDescription")}
          emptyAction={
            <Link href="/explore">
              <Button size="sm" variant="secondary">
                {t("libraryEmptyCta")}
              </Button>
            </Link>
          }
        />

        <BookRail
          title={t("popularTitle")}
          seeAllHref="/explore?sort=popular"
          seeAllLabel={t("seeAll")}
          items={popularItems}
          itemKey={(b) => b.slug}
          renderItem={(b) => <CoverCard book={b} />}
        />

        <BookRail
          title={t("newTitle")}
          items={newItems}
          itemKey={(b) => b.slug}
          renderItem={(b) => <CoverCard book={b} />}
        />
      </div>
    </div>
  );
}
