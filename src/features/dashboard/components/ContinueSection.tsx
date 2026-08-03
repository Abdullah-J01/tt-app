"use client";

import { useState } from "react";
import { PlayCircle } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { cardParam, chapterParam } from "@/lib/chapters";
import type { ProgressEntry } from "@/features/reading-progress/repository";
import { BookPreviewTile } from "./BookPreviewTile";
import { Carousel } from "./Carousel";
import { ContinueHero, ContinueHeroSkeleton } from "./ContinueHero";
import { TILE_WIDTH } from "./RailStates";
import { SectionHeader } from "./SectionHeader";

export type ContinueItem = ProgressEntry & { slug: string };

interface ContinueSectionProps {
  items: ContinueItem[];
  /** Data still on its way (localStorage hydration today, the API later). */
  loading?: boolean;
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
 *
 * Renders nothing once we know there's nothing to continue. "Nothing in
 * progress" is not news to someone who has never opened a book — it just pushes
 * the rows that *do* have content (Your Library, Popular) off their first screen.
 *
 * While `loading` it renders the hero placeholder instead, and it does so in the
 * server HTML too. Reading position is client-only, so SSR can't know whether
 * this section belongs on the page — but rendering *nothing* is the worse guess:
 * a returning user's hero then pops in after hydration and shoves the whole page
 * (and the footer, which was sitting halfway up the screen) down. Holding the
 * hero's height is right for everyone who has a book open, and the one case it
 * gets wrong — a brand-new account — resolves in the first client commit.
 */
export function ContinueSection({ items, loading }: ContinueSectionProps) {
  const t = useTranslations("app_app_home_page");
  const [picked, setPicked] = useState<string | null>(null);

  // Derived, not stored: if the picked book drops out of the list (progress
  // reset, a fresh fetch), the hero falls back to the most recent one instead
  // of pointing at something that no longer exists.
  const selected = items.find((i) => i.slug === picked) ?? items[0];

  if (!loading && !selected) return null;

  return (
    <section>
      <SectionHeader
        title={t("continueTitle")}
        description={t("continueDescription")}
        icon={<PlayCircle />}
        count={loading ? undefined : items.length}
      />

      {/* Hero only, no rail placeholder: the carousel is itself conditional
          (`items.length > 1`), and most people have exactly one book open — so
          reserving a row of tiles would over-reserve for the common case and
          make the page shrink at hydration instead of grow. */}
      {loading || !selected ? (
        <div className="mt-4">
          <ContinueHeroSkeleton />
        </div>
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
