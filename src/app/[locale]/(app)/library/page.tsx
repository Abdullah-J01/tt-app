"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "@/i18n/client";
import { useSession } from "next-auth/react";
import Link from "@/i18n/Link";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { BookTileSkeleton, CardTileSkeleton, LibraryGridSkeleton } from "@/components/skeletons";
import { useLazyList } from "@/lib/useLazyList";
import { usePersistedChoice } from "@/lib/usePersistedChoice";
import { deviceStorageKey } from "@/lib/storage";
import { useLibrary } from "@/features/library/useLibrary";
import { FeedCardTile } from "@/features/library/components/FeedCardTile";
import { BookTile, type LibraryBook } from "@/features/library/components/BookTile";
import { AuthGate } from "@/components/auth/AuthGate";

const TABS = ["cards", "studybooks"] as const;
const CARDS_FILTERS = ["saved", "liked"] as const;
type Tab = (typeof TABS)[number];
type CardsFilter = (typeof CARDS_FILTERS)[number];

const easeOut = [0.22, 1, 0.36, 1] as const;

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const tileVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: easeOut } },
};

/** Personal library / stash (UI brief §6.6). Liked/saved cards from the feed. */
/** Library home. Guests get an in-page sign-in panel instead of a redirect. */
export default function LibraryPage() {
  return (
    <AuthGate>
      <LibraryContent />
    </AuthGate>
  );
}

function LibraryContent() {
  const t = useTranslations("app_app_library_page");
  // Active tab + cards filter survive hard reloads. Device-scoped on purpose
  // (`@/lib/storage`): pure view state, no user content — and keeping it
  // session-independent is what lets it apply before first paint, with no
  // wrong-tab flash while the session resolves.
  const [tab, setTab] = usePersistedChoice<Tab>(deviceStorageKey("libraryTab"), "cards", TABS);
  const [filter, setFilter] = usePersistedChoice<CardsFilter>(
    deviceStorageKey("libraryFilter"),
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

  const books = useMemo<LibraryBook[]>(
    () =>
      savedBooks.map((b) => ({
        bookSlug: b.bookSlug,
        bookTitle: b.bookTitle,
        bookAuthor: b.bookAuthor,
        subject: b.subject,
        // Catalog backfill (as in the cards tab) for pre-`cover` snapshots.
        coverImage: b.cover ?? catalogCovers[b.bookSlug],
      })),
    [savedBooks, catalogCovers],
  );

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
    <div className="mx-auto min-h-screen max-w-5xl bg-white px-4 py-6 pb-24 sm:px-6 md:py-10 lg:pb-12 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOut }}
        className="text-ink text-2xl font-bold tracking-tight"
      >
        {t("title")}
      </motion.h1>

      {/* Segmented tab control with a sliding active pill */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: easeOut }}
        className="bg-lavender/50 mt-6 inline-flex gap-1 rounded-full p-1"
      >
        <TabButton active={tab === "cards"} onClick={() => setTab("cards")}>
          {t("tabCards")}
        </TabButton>
        <TabButton active={tab === "studybooks"} onClick={() => setTab("studybooks")}>
          {t("tabStudybooks")}
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
                {t("filterSaved")}
              </Chip>
              <Chip selected={filter === "liked"} onClick={() => setFilter("liked")}>
                {t("filterLiked")}
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
            // Same columns as the cards grid so both tabs' tiles match in
            // size; the roomier row gap leaves air for the page-stack depth.
            className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5"
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

      
        {!loadingLibrary && !showCards && !showBooks && (
          <motion.div
            key="empty"
            initial={fromSkeleton.current ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="mt-12 flex flex-col items-center text-center"
          >
            <span className="bg-lavender text-violet grid h-16 w-16 place-items-center rounded-full">
              <Bookmark className="h-8 w-8" />
            </span>
            <p className="text-ink mt-4 font-semibold">
              {tab === "cards" ? t("emptyCardsTitle") : t("emptyBooksTitle")}
            </p>
            <p className="text-muted mt-1 max-w-xs text-sm">
              {loggedOut ? t("emptyLoggedOutBody") : t("emptyBody")}
            </p>
            {/* UI-cleanup test: feed hidden — the empty-state CTA goes to
                Explore. Was "/feed". */}
            <Link href={loggedOut ? "/login?callbackUrl=%2Flibrary" : "/explore"} className="mt-6">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button>{loggedOut ? t("login") : t("goToFeed")}</Button>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
