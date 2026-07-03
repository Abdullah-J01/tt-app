"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bookmark, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Pill } from "@/components/ui/Pill";
import { useLibrary, type LibraryEntry } from "@/features/library/useLibrary";

type Tab = "cards" | "studybooks";
type CardsFilter = "saved" | "liked";
/** What a Studybooks-tab row needs — satisfied by both BookEntry and LibraryEntry. */
type LibraryBook = Pick<LibraryEntry, "bookSlug" | "bookTitle" | "bookAuthor" | "subject">;

/** Personal library / stash (UI brief §6.6). Liked/saved cards from the feed. */
export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>("cards");
  const [filter, setFilter] = useState<CardsFilter>("saved");
  const { status } = useSession();
  const { liked, saved, books: savedBooks, hydrated, toggleLiked, toggleSaved } = useLibrary();

  const entries = filter === "saved" ? saved : liked;

  /** Directly saved studybooks first, then unique books behind saved/liked cards. */
  const books = useMemo(() => {
    const seen = new Map<string, LibraryBook>();
    for (const b of [...savedBooks, ...saved, ...liked]) {
      if (!seen.has(b.bookSlug)) seen.set(b.bookSlug, b);
    }
    return [...seen.values()];
  }, [savedBooks, saved, liked]);

  const loggedOut = status === "unauthenticated";
  const showCards = tab === "cards" && !loggedOut && entries.length > 0;
  const showBooks = tab === "studybooks" && !loggedOut && books.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-24 md:py-10 md:pb-12">
      <h1 className="text-2xl font-bold">Library</h1>

      <div className="mt-6 flex gap-2">
        <TabButton active={tab === "cards"} onClick={() => setTab("cards")}>
          Saved cards
        </TabButton>
        <TabButton active={tab === "studybooks"} onClick={() => setTab("studybooks")}>
          Studybooks
        </TabButton>
      </div>

      {tab === "cards" && !loggedOut && (saved.length > 0 || liked.length > 0) && (
        <div className="mt-4 flex gap-2">
          <Chip selected={filter === "saved"} onClick={() => setFilter("saved")}>
            Saved
          </Chip>
          <Chip selected={filter === "liked"} onClick={() => setFilter("liked")}>
            Liked
          </Chip>
        </div>
      )}

      {showCards && (
        <ul className="mt-6 space-y-3">
          {entries.map((entry) => (
            <li key={entry.cardId}>
              <SavedCardRow
                entry={entry}
                onRemove={() =>
                  filter === "saved" ? toggleSaved(entry) : toggleLiked(entry)
                }
              />
            </li>
          ))}
        </ul>
      )}

      {showBooks && (
        <ul className="mt-6 space-y-3">
          {books.map((book) => (
            <li key={book.bookSlug}>
              <Link href={`/studybook/${book.bookSlug}`} className="block">
                <Card className="hover:bg-lavender/30 flex items-center gap-3 transition-colors">
                  <span className="bg-lavender text-violet grid h-10 w-10 shrink-0 place-items-center rounded-full">
                    <BookOpen className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{book.bookTitle}</span>
                    <span className="text-muted block truncate text-sm">{book.bookAuthor}</span>
                  </span>
                  <Pill>{book.subject}</Pill>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state — only once hydrated, so saved items don't flash it. */}
      {hydrated && !showCards && !showBooks && (
        <div className="mt-12 flex flex-col items-center text-center">
          <span className="bg-lavender text-violet grid h-16 w-16 place-items-center rounded-full">
            <Bookmark className="h-8 w-8" />
          </span>
          <p className="mt-4 font-semibold">
            {tab === "cards" ? "No saved cards yet" : "No studybooks yet"}
          </p>
          <p className="text-muted mt-1 max-w-xs text-sm">
            {loggedOut
              ? "Log in to save cards from the feed and find them here."
              : "Tap the bookmark on any card to save it here for later."}
          </p>
          <Link
            href={loggedOut ? "/login?callbackUrl=%2Flibrary" : "/feed"}
            className="mt-6"
          >
            <Button>{loggedOut ? "Log in" : "Go to feed"}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

/** One liked/saved card: links back to its feed card, trailing X removes it. */
function SavedCardRow({ entry, onRemove }: { entry: LibraryEntry; onRemove: () => void }) {
  return (
    <Card className="flex items-start gap-3">
      <Link href={`/feed?slug=${entry.cardSlug}`} className="min-w-0 flex-1">
        <span className="block font-semibold">{entry.heading}</span>
        <span className="text-muted mt-0.5 line-clamp-2 block text-sm">{entry.body}</span>
        <span className="text-muted mt-2 block truncate text-xs">
          {entry.bookTitle} · {entry.bookAuthor}
        </span>
        <span className="mt-2 flex gap-1.5">
          <Pill>{entry.subject}</Pill>
          <Pill variant="mist">{entry.grade}</Pill>
        </span>
      </Link>
      <Button
        unstyled
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${entry.heading}`}
        className="text-muted hover:bg-ink/5 hover:text-ink grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </Button>
    </Card>
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
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-violet text-white" : "bg-lavender text-ink hover:bg-violet/10",
      )}
    >
      {children}
    </Button>
  );
}
