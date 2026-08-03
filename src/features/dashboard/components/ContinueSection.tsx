"use client";

import { useState, type ReactNode } from "react";
import { PlayCircle } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { cardParam, chapterParam } from "@/lib/chapters";
import type { ProgressEntry } from "@/features/reading-progress/repository";
import { BookPreviewTile } from "./BookPreviewTile";
import { Carousel } from "./Carousel";
import { ContinueHero, ContinueHeroSkeleton } from "./ContinueHero";
import { RailEmpty, RailSkeleton, TILE_WIDTH } from "./RailStates";
import { SectionHeader } from "./SectionHeader";

export type ContinueItem = ProgressEntry & { slug: string };

interface ContinueSectionProps {
  items: ContinueItem[];
  /** Data still on its way (localStorage hydration today, the API later). */
  loading?: boolean;
  emptyAction?: ReactNode;
}

/**
 * How far into the book, as a percentage. Tolerates entries stored before
 * `globalIndex`/`totalCards` existed — a half-written schema in someone's
 * localStorage must not render a `NaN%` bar.
 */
function pctRead(entry: Pick<ProgressEntry, "globalIndex" | "totalCards">): number {
  const { globalIndex, totalCards } = entry;
  if (typeof globalIndex !== "number" || !totalCards) return 0;
  return Math.min(100, Math.round(((globalIndex + 1) / totalCards) * 100));
}

function readerHref(item: ContinueItem): string {
  return `/studybook/${item.slug}/read?chapter=${chapterParam(item.chapterIndex)}&card=${cardParam(item.cardIndex ?? 0)}`;
}

/**
 * Continue: a hero for the book you're about to open, and a carousel of every
 * other book in progress. Picking a tile loads it into the hero instead of
 * navigating — you compare where you left off across books, then commit once.
 */
export function ContinueSection({ items, loading, emptyAction }: ContinueSectionProps) {
  const t = useTranslations("app_app_home_page");
  const [picked, setPicked] = useState<string | null>(null);

  // Derived, not stored: if the picked book drops out of the list (progress
  // reset, a fresh fetch), the hero falls back to the most recent one instead
  // of pointing at something that no longer exists.
  const selected = items.find((i) => i.slug === picked) ?? items[0];

  return (
    <section>
      <SectionHeader
        title={t("continueTitle")}
        description={t("continueDescription")}
        icon={<PlayCircle />}
        count={loading ? undefined : items.length}
      />

      {loading ? (
        <>
          <div className="mt-4">
            <ContinueHeroSkeleton />
          </div>
          <RailSkeleton />
        </>
      ) : !selected ? (
        <RailEmpty
          icon={<PlayCircle />}
          title={t("continueEmptyTitle")}
          description={t("continueEmptyDescription")}
          action={emptyAction}
        />
      ) : (
        <>
          <div className="mt-4">
            <ContinueHero
              title={selected.bookTitle}
              author={selected.bookAuthor}
              subjectSlug={selected.subject}
              cover={selected.cover}
              progressPct={pctRead(selected)}
              chapter={selected.chapterIndex + 1}
              card={(selected.globalIndex ?? 0) + 1}
              totalCards={selected.totalCards ?? 0}
              href={readerHref(selected)}
            />
          </div>

          {items.length > 1 && (
            <Carousel prevLabel={t("railPrev")} nextLabel={t("railNext")} className="mt-4">
              {items.map((item) => (
                <div key={item.slug} className={`${TILE_WIDTH} snap-start`}>
                  <BookPreviewTile
                    slug={item.slug}
                    title={item.bookTitle}
                    author={item.bookAuthor}
                    subjectSlug={item.subject}
                    cover={item.cover}
                    progressPct={pctRead(item)}
                    selected={item.slug === selected.slug}
                    onSelect={() => setPicked(item.slug)}
                  />
                </div>
              ))}
            </Carousel>
          )}
        </>
      )}
    </section>
  );
}
