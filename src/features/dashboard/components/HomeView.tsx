"use client";

import { useMemo } from "react";
import { Sparkles, TrendingUp } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { CoverCard } from "@/features/explore/components/CoverCard";
import { useAppSelector } from "@/store/hooks";
import { useLibrary } from "@/features/library/useLibrary";
import { useReadingProgress } from "@/features/reading-progress/useReadingProgress";
import { useStreak } from "@/features/streak";
import { BookRail } from "./BookRail";
import { LibraryRail } from "./LibraryRail";
import { ContinueSection, type ContinueItem } from "./ContinueSection";
import { HomeHeader } from "./HomeHeader";
import { HomeSkeleton } from "./HomeSkeleton";
import type { HomeData } from "../data";

export function HomeView({ popular, freshlyAdded }: HomeData) {
  const t = useTranslations("app_app_home_page");
  const { progress, hydrated: progressHydrated } = useReadingProgress();
  const {
    liked,
    saved,
    books: savedBooks,
    hydrated: libraryHydrated,
    toggleSaved,
    toggleLiked,
  } = useLibrary();
  const { streak, hydrated: streakHydrated } = useStreak();
  const authStatus = useAppSelector((s) => s.auth.status);
  const user = useAppSelector((s) => s.auth.user);

  /**
   * One gate for the whole page, and every source is in it.
   *
   * Continue, Your Library and the stats all come from client-only stores, and
   * they don't finish together — the session resolves, then the per-user
   * buckets keyed off its email, then the streak. Letting each row reveal on
   * its own flag is what made the page rearrange itself while you watched:
   * Continue would render, decide it had nothing, unmount, and Your Library
   * would jump up into its place. Nothing renders its real shape until all of
   * it is known, and then it renders at once.
   */
  const loading =
    authStatus === "loading" || !progressHydrated || !libraryHydrated || !streakHydrated;

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
  const { continueItems, popularItems, newItems } = useMemo(() => {
    const shown = new Set<string>();

    const continueItems: ContinueItem[] = Object.entries(progress)
      .map(([slug, entry]) => ({ ...entry, slug }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    continueItems.forEach((c) => shown.add(c.slug));

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

    return { continueItems, popularItems, newItems };
  }, [progress, savedBooks, popular, freshlyAdded]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-6 md:py-10 lg:px-8 lg:pb-12">
      <HomeHeader
        name={user?.name}
        streak={streak}
        inProgress={continueItems.length}
        saved={savedBooks.length}
        loading={loading}
      />

      {loading ? (
        <div className="mt-8">
          <HomeSkeleton />
        </div>
      ) : (
        <div className="anim-fade-in mt-8 flex flex-col gap-10 sm:gap-12">
          {/* Self-hiding: no reading history, no Continue row — Your Library
              leads the page instead. Safe to do now that the rows only ever
              render once the answer is known. */}
          <ContinueSection items={continueItems} />

          {/* Nav/header entry points to /library are hidden (UI-cleanup test),
              but the section itself stays on Home — a 3-way toggle (saved
              cards / saved books / liked) over one same-size tile rail. */}
          <LibraryRail
            savedCards={saved}
            savedBooks={savedBooks}
            likedCards={liked}
            onToggleSaved={toggleSaved}
            onToggleLiked={toggleLiked}
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
      )}
    </div>
  );
}
