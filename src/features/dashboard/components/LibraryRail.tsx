"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Compass, Heart } from "lucide-react";
import Link from "@/i18n/Link";
import { useTranslations } from "@/i18n/client";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { usePersistedChoice } from "@/lib/usePersistedChoice";
import { deviceStorageKey } from "@/lib/storage";
import type { BookEntry, LibraryEntry } from "@/features/library/useLibrary";
import { FeedCardTile } from "@/features/library/components/FeedCardTile";
import { BookTile, type LibraryBook } from "@/features/library/components/BookTile";
import { Carousel } from "./Carousel";
import { RailEmpty, RailSkeleton, TILE_WIDTH } from "./RailStates";
import { SectionHeader } from "./SectionHeader";

const easeOut = [0.22, 1, 0.36, 1] as const;
const FILTERS = ["savedCards", "savedBooks", "liked"] as const;
type Filter = (typeof FILTERS)[number];

interface LibraryRailProps {
  savedCards: LibraryEntry[];
  savedBooks: BookEntry[];
  likedCards: LibraryEntry[];
  loading?: boolean;
  onToggleSaved: (entry: LibraryEntry) => void;
  onToggleLiked: (entry: LibraryEntry) => void;
}

/**
 * Home's Library row: a three-way toggle (saved cards / saved books / liked
 * cards) over one same-size tile rail — switching the toggle swaps the rail's
 * contents with a slow cross-fade instead of jumping. The chosen toggle value
 * is device-persisted (`usePersistedChoice`, mirrors the full Library page's
 * own tab/filter memory) so it survives reloads.
 */
export function LibraryRail({
  savedCards,
  savedBooks,
  likedCards,
  loading,
  onToggleSaved,
  onToggleLiked,
}: LibraryRailProps) {
  const t = useTranslations("app_app_home_page");
  const [filter, setFilter] = usePersistedChoice<Filter>(
    deviceStorageKey("homeLibraryFilter"),
    "savedCards",
    FILTERS,
  );

  // BookEntry → the shape BookTile renders (same as the full Library page).
  const books = useMemo<LibraryBook[]>(
    () =>
      savedBooks.map((b) => ({
        bookSlug: b.bookSlug,
        bookTitle: b.bookTitle,
        bookAuthor: b.bookAuthor,
        subject: b.subject,
        coverImage: b.cover,
      })),
    [savedBooks],
  );

  const count =
    filter === "savedCards"
      ? savedCards.length
      : filter === "savedBooks"
        ? books.length
        : likedCards.length;
  const isEmpty = count === 0;

  return (
    <section>
      <SectionHeader
        title={t("libraryTitle")}
        description={t("libraryDescription")}
        icon={<Bookmark />}
        iconVariant="green"
        count={loading ? undefined : count}
        seeAllHref={!loading && !isEmpty ? "/library" : undefined}
        seeAllLabel={t("seeAll")}
      />

 
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <Chip
          selected={filter === "savedCards"}
          onClick={() => setFilter("savedCards")}
          className="shrink-0"
        >
          {t("libraryToggleSavedCards")}
        </Chip>
        <Chip
          selected={filter === "savedBooks"}
          onClick={() => setFilter("savedBooks")}
          className="shrink-0"
        >
          {t("libraryToggleSavedBooks")}
        </Chip>
        <Chip selected={filter === "liked"} onClick={() => setFilter("liked")} className="shrink-0">
          {t("libraryToggleLiked")}
        </Chip>
      </div>

      {loading ? (
        <RailSkeleton />
      ) : (
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key={`empty-${filter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              <RailEmpty
                icon={filter === "liked" ? <Heart /> : <Bookmark />}
                title={
                  filter === "savedCards"
                    ? t("libraryEmptySavedCardsTitle")
                    : filter === "savedBooks"
                      ? t("libraryEmptySavedBooksTitle")
                      : t("libraryEmptyLikedTitle")
                }
                description={
                  filter === "savedCards"
                    ? t("libraryEmptySavedCardsDescription")
                    : filter === "savedBooks"
                      ? t("libraryEmptySavedBooksDescription")
                      : t("libraryEmptyLikedDescription")
                }
                action={
                  <Link href="/explore">
                    <Button size="sm" leadingIcon={<Compass className="h-4 w-4" />}>
                      {t("libraryEmptyCta")}
                    </Button>
                  </Link>
                }
              />
            </motion.div>
          ) : (
            <motion.div
              key={`rail-${filter}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              <Carousel prevLabel={t("railPrev")} nextLabel={t("railNext")} className="mt-4">
                {filter === "savedCards" &&
                  savedCards.map((entry) => (
                    <div key={entry.cardId} className={`${TILE_WIDTH} snap-start`}>
                      <FeedCardTile
                        entry={entry}
                        liked={false}
                        onRemove={() => onToggleSaved(entry)}
                      />
                    </div>
                  ))}
                {filter === "savedBooks" &&
                  books.map((book) => (
                    <div key={book.bookSlug} className={`${TILE_WIDTH} snap-start`}>
                      <BookTile book={book} />
                    </div>
                  ))}
                {filter === "liked" &&
                  likedCards.map((entry) => (
                    <div key={entry.cardId} className={`${TILE_WIDTH} snap-start`}>
                      <FeedCardTile entry={entry} liked onRemove={() => onToggleLiked(entry)} />
                    </div>
                  ))}
              </Carousel>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </section>
  );
}
