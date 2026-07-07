"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, BookOpen, Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { BookTileSkeleton, CardTileSkeleton, LibraryGridSkeleton } from "@/components/skeletons";
import { useLazyList } from "@/lib/useLazyList";
import { usePersistedChoice } from "@/lib/usePersistedChoice";
import { useLibrary, type LibraryEntry } from "@/features/library/useLibrary";

const TABS = ["cards", "studybooks"] as const;
const CARDS_FILTERS = ["saved", "liked"] as const;
type Tab = (typeof TABS)[number];
type CardsFilter = (typeof CARDS_FILTERS)[number];
/** What a Studybooks-tab tile needs — satisfied by both BookEntry and LibraryEntry. */
type LibraryBook = Pick<LibraryEntry, "bookSlug" | "bookTitle" | "bookAuthor" | "subject"> & {
  /** Optional — falls back to a subject-colored cover when absent. */
  coverImage?: string;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

/** On-brand gradient per subject, so cards/covers without a real image still look designed. */
const SUBJECT_GRADIENTS: Record<string, string> = {
  Physics: "from-[#483666] to-[#7A6A9E]",
  Biology: "from-[#2F8F4E] to-[#6BC98A]",
  History: "from-[#5A3ED0] to-[#9C85F0]",
  Psychology: "from-[#B0793B] to-[#F4A93B]",
};
const DEFAULT_GRADIENT = "from-violet to-violet-dark";

function subjectGradient(subject: string) {
  return SUBJECT_GRADIENTS[subject] ?? DEFAULT_GRADIENT;
}

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const tileVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: easeOut } },
};

/** Personal library / stash (UI brief §6.6). Liked/saved cards from the feed. */
export default function LibraryPage() {
  // Active tab + cards filter survive hard reloads (non-sensitive UI state).
  const [tab, setTab] = usePersistedChoice<Tab>("tt:library-tab", "cards", TABS);
  const [filter, setFilter] = usePersistedChoice<CardsFilter>(
    "tt:library-filter",
    "saved",
    CARDS_FILTERS,
  );
  const { status } = useSession();
  const { liked, saved, books: savedBooks, hydrated, toggleLiked, toggleSaved } = useLibrary();

  /**
   * bookSlug → cover from the live catalog. Entries snapshotted before
   * `cover` existed (or before the book had art) render as plain gradients;
   * this backfills them so every tile shows the same cover treatment.
   */
  const [catalogCovers, setCatalogCovers] = useState<Record<string, string>>({});
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/studybooks", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { studybooks?: { slug: string; cover?: string }[] } | null) => {
        if (!data?.studybooks) return;
        const map: Record<string, string> = {};
        for (const book of data.studybooks) if (book.cover) map[book.slug] = book.cover;
        setCatalogCovers(map);
      })
      .catch(() => {
        /* offline / aborted — tiles keep the gradient fallback */
      });
    return () => controller.abort();
  }, []);

  const entries = useMemo(() => {
    const base = filter === "saved" ? saved : liked;
    return base.map((e) => (e.cover ? e : { ...e, cover: catalogCovers[e.bookSlug] }));
  }, [filter, saved, liked, catalogCovers]);

  /**
   * Directly saved studybooks first, then unique books behind saved/liked cards.
   * Both BookEntry and LibraryEntry expose the image as `cover`; we normalize it
   * to `coverImage` for the tile. Dedup by bookSlug, but if a later duplicate
   * carries a cover the first one lacked, keep it — so the image is never lost
   * when the same book appears across sections.
   */
  const books = useMemo(() => {
    const seen = new Map<string, LibraryBook>();
    for (const b of [...savedBooks, ...saved, ...liked]) {
      const existing = seen.get(b.bookSlug);
      if (!existing) {
        seen.set(b.bookSlug, {
          bookSlug: b.bookSlug,
          bookTitle: b.bookTitle,
          bookAuthor: b.bookAuthor,
          subject: b.subject,
          coverImage: b.cover,
        });
      } else if (!existing.coverImage && b.cover) {
        existing.coverImage = b.cover;
      }
    }
    // Same catalog backfill as the cards tab, for pre-`cover` snapshots.
    for (const b of seen.values()) {
      if (!b.coverImage) b.coverImage = catalogCovers[b.bookSlug];
    }
    return [...seen.values()];
  }, [savedBooks, saved, liked, catalogCovers]);

  const loggedOut = status === "unauthenticated";
  const showCards = tab === "cards" && !loggedOut && entries.length > 0;
  const showBooks = tab === "studybooks" && !loggedOut && books.length > 0;

  // Render grids in viewport-sized batches; reset the window on tab/filter swaps.
  const lazyCards = useLazyList(entries, 12, `${tab}:${filter}`);
  const lazyBooks = useLazyList(books, 12, tab);

  // Skeleton while the stash hydrates / the session resolves, unless we
  // already have tiles to show. Also covers the logged-out check so the
  // "log in" empty state never flashes the wrong copy.
  const loadingLibrary = (!hydrated || status === "loading") && !showCards && !showBooks;

  // Content replacing the skeleton mounts without the entrance animation —
  // the data is already local, so staggering in from hidden reads as a second
  // loading gap. Later tab/filter switches still animate. Ref flips in an
  // effect, so the swap render itself still sees `true`.
  const fromSkeleton = useRef(true);
  useEffect(() => {
    if (!loadingLibrary) fromSkeleton.current = false;
  }, [loadingLibrary]);

  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-white px-4 py-6 pb-24 md:py-10 md:pb-12">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOut }}
        className="text-ink text-2xl font-bold tracking-tight"
      >
        Library
      </motion.h1>

      {/* Segmented tab control with a sliding active pill */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: easeOut }}
        className="bg-lavender/50 mt-6 inline-flex gap-1 rounded-full p-1"
      >
        <TabButton active={tab === "cards"} onClick={() => setTab("cards")}>
          Saved cards
        </TabButton>
        <TabButton active={tab === "studybooks"} onClick={() => setTab("studybooks")}>
          Studybooks
        </TabButton>
      </motion.div>

      <AnimatePresence>
        {tab === "cards" && !loggedOut && (saved.length > 0 || liked.length > 0) && (
          <motion.div
            initial={fromSkeleton.current ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex gap-2">
              <Chip selected={filter === "saved"} onClick={() => setFilter("saved")}>
                Saved
              </Chip>
              <Chip selected={filter === "liked"} onClick={() => setFilter("liked")}>
                Liked
              </Chip>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loadingLibrary && <LibraryGridSkeleton tab={tab} />}

      <AnimatePresence mode="wait">
        {showCards && (
          <motion.ul
            key={`cards-${filter}`}
            initial={fromSkeleton.current ? false : "hidden"}
            animate="show"
            exit={{ opacity: 0 }}
            variants={gridVariants}
            className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5"
          >
            <AnimatePresence initial={false}>
              {lazyCards.items.map((entry) => (
                <motion.li
                  key={entry.cardId}
                  layout
                  variants={tileVariants}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                >
                  <FeedCardTile
                    entry={entry}
                    liked={filter === "liked"}
                    onRemove={() => (filter === "saved" ? toggleSaved(entry) : toggleLiked(entry))}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
            {/* load-more sentinel: skeleton tiles that reveal the next batch on approach */}
            {lazyCards.hasMore && (
              <>
                <li ref={lazyCards.sentinelRef} aria-hidden="true">
                  <CardTileSkeleton />
                </li>
                <li aria-hidden="true">
                  <CardTileSkeleton />
                </li>
              </>
            )}
          </motion.ul>
        )}

        {showBooks && (
          <motion.ul
            key="studybooks"
            initial={fromSkeleton.current ? false : "hidden"}
            animate="show"
            exit={{ opacity: 0 }}
            variants={gridVariants}
            className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4"
          >
            {lazyBooks.items.map((book) => (
              <motion.li key={book.bookSlug} variants={tileVariants}>
                <BookTile book={book} />
              </motion.li>
            ))}
            {lazyBooks.hasMore && (
              <>
                <li ref={lazyBooks.sentinelRef} aria-hidden="true">
                  <BookTileSkeleton />
                </li>
                <li aria-hidden="true">
                  <BookTileSkeleton />
                </li>
              </>
            )}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Empty state — only after loading, so saved items don't flash it. */}
      {!loadingLibrary && !showCards && !showBooks && (
        <motion.div
          initial={fromSkeleton.current ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOut }}
          className="mt-12 flex flex-col items-center text-center"
        >
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200, damping: 14 }}
            className="bg-lavender text-violet grid h-16 w-16 place-items-center rounded-full"
          >
            <Bookmark className="h-8 w-8" />
          </motion.span>
          <p className="text-ink mt-4 font-semibold">
            {tab === "cards" ? "No saved cards yet" : "No studybooks yet"}
          </p>
          <p className="text-muted mt-1 max-w-xs text-sm">
            {loggedOut
              ? "Log in to save cards from the feed and find them here."
              : "Tap the bookmark on any card to save it here for later."}
          </p>
          <Link href={loggedOut ? "/login?callbackUrl=%2Flibrary" : "/feed"} className="mt-6">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button>{loggedOut ? "Log in" : "Go to feed"}</Button>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </div>
  );
}

/**
 * A saved/liked entry rendered as a miniature replica of the actual feed card —
 * gradient background, glass badge, headline — so Library feels continuous with the feed.
 */
function FeedCardTile({
  entry,
  liked,
  onRemove,
}: {
  entry: LibraryEntry;
  liked: boolean;
  onRemove: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: easeOut }}
      className={cn(
        "group relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br shadow-md ring-1 ring-black/5",
        subjectGradient(entry.subject),
      )}
    >
      {/* real card artwork when present, with a dark scrim so text stays legible */}
      {entry.cover && (
        <>
          <Image
            src={entry.cover}
            alt=""
            fill
            sizes="(min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20" />
        </>
      )}

      {/* ambient glow blob for depth, matches feed card treatment */}
      <div className="pointer-events-none absolute -top-8 -right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

      <Link href={`/feed?slug=${entry.cardSlug}`} className="relative flex h-full flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
            {entry.subject}
          </span>
          {liked && (
            <Button
              unstyled
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${entry.heading}`}
              className="absolute top-4 right-2 flex h-8 w-8 items-center justify-center"
            >
              <Heart className="h-3.5 w-3.5 shrink-0 fill-white/80 text-white/80" />{" "}
            </Button>
          )}
        </div>

        <p className="mt-2.5 line-clamp-4 flex-1 text-sm leading-snug font-semibold text-white">
          {entry.heading}
        </p>

        <div className="mt-2 border-t border-white/15 pt-2">
          <p className="truncate text-[11px] font-medium text-white/70">{entry.bookTitle}</p>
          <p className="truncate text-[10px] text-white/45">{entry.bookAuthor}</p>
        </div>
      </Link>

      {!liked && (
        <Button
          unstyled
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${entry.heading}`}
          className="absolute top-4 right-2 flex h-8 w-8 items-center justify-center"
        >
          <Bookmark className="h-4 w-4 fill-white text-white md:h-6 md:w-6" fill="currentColor" />
        </Button>
      )}
    </motion.div>
  );
}

/**
 * A studybook rendered as an actual book cover: flat spine on the left,
 * a couple of stacked "pages" behind it for depth, subtle 3D tilt on hover.
 */
function BookTile({ book }: { book: LibraryBook }) {
  return (
    <Link href={`/studybook/${book.bookSlug}`} className="group block [perspective:900px]">
      <motion.div
        whileHover={{ rotateY: -8, y: -4 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.25, ease: easeOut }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative aspect-[2/3]"
      >
        {/* stacked pages behind the cover, for physical depth */}
        <div className="bg-ink/10 absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-l-[3px] rounded-r-lg" />
        <div className="bg-ink/15 absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-l-[3px] rounded-r-lg" />

        {/* cover */}
        <div
          className={cn(
            "relative h-full w-full overflow-hidden rounded-l-[3px] rounded-r-lg bg-gradient-to-br shadow-lg ring-1 ring-black/10",
            subjectGradient(book.subject),
          )}
        >
          {book.coverImage ? (
            <Image src={book.coverImage} alt="" fill sizes="200px" className="object-cover" />
          ) : (
            <BookOpen className="absolute -right-4 -bottom-4 h-28 w-28 text-white/10" aria-hidden />
          )}

          {/* spine */}
          <div className="absolute inset-y-0 left-0 w-[10px] bg-gradient-to-r from-black/35 to-transparent" />
          <div className="absolute inset-y-1.5 left-[3px] w-px bg-white/10" />

          <div className="absolute top-3 right-2.5 left-4">
            <Pill className="bg-white/20 text-white">{book.subject}</Pill>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent px-4 pt-8 pb-3 pl-5">
            <p className="line-clamp-2 text-sm leading-snug font-semibold text-white">
              {book.bookTitle}
            </p>
            <p className="mt-0.5 truncate text-xs text-white/65">{book.bookAuthor}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      unstyled
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        selected
          ? "border-violet bg-violet/10 text-violet"
          : "text-muted hover:text-ink border-black/10",
      )}
    >
      {children}
    </Button>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      unstyled
      onClick={onClick}
      className={cn(
        "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active ? "text-white" : "text-ink hover:text-violet",
      )}
    >
      {active && (
        <motion.span
          layoutId="library-tab-pill"
          className="bg-violet absolute inset-0 rounded-full"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </Button>
  );
}
