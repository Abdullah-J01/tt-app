"use client";

import { useMemo } from "react";
import { Bookmark, Compass, Sparkles, TrendingUp } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import Link from "@/i18n/Link";
import { Button } from "@/components/ui/Button";
import { CoverCard } from "@/features/explore/components/CoverCard";
import { useLibrary } from "@/features/library/useLibrary";
import { useReadingProgress } from "@/features/reading-progress/useReadingProgress";
import { BookRail } from "./BookRail";
import { BookPreviewTile } from "./BookPreviewTile";
import { ContinueSection, type ContinueItem } from "./ContinueSection";
import { HomeHeader } from "./HomeHeader";
import type { HomeData } from "../data";

const LIBRARY_PREVIEW_SIZE = 6;

export function HomeView({ popular, freshlyAdded }: HomeData) {
  const t = useTranslations("app_app_home_page");
  const { progress, hydrated: progressHydrated } = useReadingProgress();
  const { books: savedBooks, hydrated: libraryHydrated } = useLibrary();

  // Continue and Your Library come from localStorage-backed stores, so they are
  // empty on the server render. Without this gate a returning user sees "your
  // library is empty" for a beat before their books pop in.
  const loading = !progressHydrated || !libraryHydrated;

  /**
   * The catalog rows (Popular, New) are deduped against the personal ones, so a
   * book you've already saved or opened never shows up again further down.
   *
   * Continue and Your Library are deliberately NOT deduped against each other:
   * saving a book and reading it are independent actions, and opening a saved
   * book in the reader puts it in `progress` — filtering it out of the library
   * rail made saved books disappear while the header still counted them (1
   * saved, "1", empty rail).
   */
  const { continueItems, libraryItems, popularItems, newItems } = useMemo(() => {
    const shown = new Set<string>();

    const continueItems: ContinueItem[] = Object.entries(progress)
      .map(([slug, entry]) => ({ ...entry, slug }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    continueItems.forEach((c) => shown.add(c.slug));

    const libraryItems = savedBooks.slice(0, LIBRARY_PREVIEW_SIZE);
    savedBooks.forEach((b) => shown.add(b.bookSlug));

    const popularItems = popular.filter((b) => !shown.has(b.slug));
    popularItems.forEach((b) => shown.add(b.slug));

    // Popular and New overlap heavily in the mock catalog. Deduping New against
    // Popular can empty it entirely — and a section that silently vanishes
    // reads as a bug, so fall back to deduping against the personal rows only.
    const deduped = freshlyAdded.filter((b) => !shown.has(b.slug));
    const newItems = deduped.length
      ? deduped
      : freshlyAdded.filter((b) => !popular.some((p) => p.slug === b.slug));

    return { continueItems, libraryItems, popularItems, newItems };
  }, [progress, savedBooks, popular, freshlyAdded]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-6 md:py-10 lg:px-8 lg:pb-12">
      <HomeHeader inProgress={continueItems.length} saved={savedBooks.length} loading={loading} />

      <div className="mt-8 flex flex-col gap-10 sm:gap-12">
        {/* Self-hiding: no reading history, no Continue row — Your Library
            leads the page instead. */}
        <ContinueSection items={continueItems} loading={loading} />

        <BookRail
          title={t("libraryTitle")}
          description={t("libraryDescription")}
          icon={<Bookmark />}
          iconVariant="green"
          seeAllHref="/library"
          seeAllLabel={t("seeAll")}
          loading={loading}
          count={savedBooks.length}
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
          emptyIcon={<Bookmark />}
          emptyTitle={t("libraryEmptyTitle")}
          emptyDescription={t("libraryEmptyDescription")}
          emptyAction={
            <Link href="/explore">
              <Button size="sm" leadingIcon={<Compass className="h-4 w-4" />}>
                {t("libraryEmptyCta")}
              </Button>
            </Link>
          }
        />

        <BookRail
          title={t("popularTitle")}
          description={t("popularDescription")}
          icon={<TrendingUp />}
          iconVariant="amber"
          seeAllHref="/explore?sort=popular"
          seeAllLabel={t("seeAll")}
          items={popularItems}
          itemKey={(b) => b.slug}
          renderItem={(b) => <CoverCard book={b} />}
          emptyIcon={<TrendingUp />}
          emptyTitle={t("catalogEmptyTitle")}
          emptyDescription={t("catalogEmptyDescription")}
        />

        <BookRail
          title={t("newTitle")}
          description={t("newDescription")}
          icon={<Sparkles />}
          iconVariant="grey"
          seeAllHref="/explore"
          seeAllLabel={t("seeAll")}
          items={newItems}
          itemKey={(b) => b.slug}
          renderItem={(b) => <CoverCard book={b} />}
          emptyIcon={<Sparkles />}
          emptyTitle={t("catalogEmptyTitle")}
          emptyDescription={t("catalogEmptyDescription")}
        />
      </div>
    </div>
  );
}
