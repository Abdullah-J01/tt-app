"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IS_DEV_MODE } from "@/lib/env";
import { useUserStorage } from "@/lib/storage";
import { useTranslations } from "@/i18n/client";
import { toastLiked, toastSaved } from "@/components/ui/Toaster";


export interface LibraryEntry {
  cardId: string;
  /** `/feed/[slug]` deep-link back to the card. */
  cardSlug: string;
  heading: string;
  body: string;
  /** `/studybook/[slug]` for the Studybooks tab. */
  bookSlug: string;
  bookTitle: string;
  bookAuthor: string;
  subject: string;
  grade: string;

  cover?: string;
  savedAt: number;
}

/** A whole studybook saved from its detail page. */
export interface BookEntry {
  bookSlug: string;
  bookTitle: string;
  bookAuthor: string;
  subject: string;
  grade: string;
  cover?: string;
  savedAt: number;
}

export interface LibraryState {
  liked: LibraryEntry[];
  saved: LibraryEntry[];
  books: BookEntry[];
}

const EVENT = "tt:library";
const EMPTY: LibraryState = { liked: [], saved: [], books: [] };

/**
 * Persistence seam — the single swap point for the real backend.
 * Dev mode: localStorage. Production: TT API (not wired yet).
 */
function readLibrary(key: string): LibraryState {
  if (!IS_DEV_MODE) return EMPTY; // TODO(team): GET /me/library from the TT API.
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<LibraryState>) };
  } catch {
    /* ignore corrupt / disabled storage */
  }
  return EMPTY;
}

function writeLibrary(key: string, state: LibraryState): void {
  if (!IS_DEV_MODE) return; // TODO(team): persist via the TT API.
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* ignore quota / disabled storage */
  }
  window.dispatchEvent(new Event(EVENT));
}

function toggle<T extends { savedAt: number }>(list: T[], entry: T, id: (e: T) => string): T[] {
  return list.some((e) => id(e) === id(entry))
    ? list.filter((e) => id(e) !== id(entry))
    : [{ ...entry, savedAt: Date.now() }, ...list];
}

const cardKey = (e: LibraryEntry) => e.cardId;
const bookKey = (e: BookEntry) => e.bookSlug;

/**
 * Client-side liked/saved store, keyed per signed-in user. Follows the
 * `useProfile` pattern: hydrate after mount, then keep every consumer
 * (feed actions, Library page, other tabs) in sync via storage/custom events.
 */
export function useLibrary() {
  const t = useTranslations("components_ui_Toaster");
  /**
   * Per-user bucket (`@/lib/storage`). Data intentionally survives sign-out —
   * it reappears when the same email logs back in (dev/demo behaviour) — but a
   * *different* account signing in on this browser never sees it.
   *
   * Unlike reading progress, a signed-out visitor may still like/save: those go
   * to the `anonymous` bucket and stay there. `ready` (not `canPersist`) is the
   * gate, so we only ever write once we know which bucket is the right one.
   */
  const { key, ready } = useUserStorage("library");

  const [state, setState] = useState<LibraryState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  // Latest state for event handlers — mutations must run OUTSIDE setState
  // updaters (persisting/dispatching inside one is a side effect during render
  // and breaks React when several rails are mounted at once).
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    /**
     * Wait for the session before reporting `hydrated` — `key` is derived from
     * the email, so reading now would hydrate the *anonymous* (empty) bucket
     * and announce it as loaded. Consumers would paint "your library is empty",
     * then repaint with the real books once the session lands. See the same
     * guard in `useReadingProgress`.
     */
    if (!ready) return;

    setState(readLibrary(key));
    setHydrated(true);
    const sync = () => setState(readLibrary(key));
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, [key, ready]);

  /**
   * Apply a mutation from a click handler: persist first, then update local
   * state (every other useLibrary instance syncs via the dispatched event).
   * Dev mode re-reads storage as the base so concurrent instances never
   * clobber each other; prod keeps in-memory state (writes are a TODO seam).
   *
   * No-ops until the session resolves: a like fired in that window would land
   * in the anonymous bucket and be invisible the moment `key` settles.
   */
  const apply = useCallback(
    (fn: (prev: LibraryState) => LibraryState) => {
      if (!ready) return;
      const prev = IS_DEV_MODE ? readLibrary(key) : stateRef.current;
      const next = fn(prev);
      writeLibrary(key, next);
      setState(next);
    },
    [key, ready],
  );

  const toggleLiked = useCallback(
    (entry: LibraryEntry) => {
      let didLike = false;
      apply((prev) => {
        didLike = !prev.liked.some((e) => cardKey(e) === entry.cardId);
        return { ...prev, liked: toggle(prev.liked, entry, cardKey) };
      });
      // Confirm only on like (not un-like), with an Undo that removes it again.
      if (didLike) {
        toastLiked(
          () =>
            apply((prev) => ({
              ...prev,
              liked: prev.liked.filter((e) => cardKey(e) !== entry.cardId),
            })),
          { message: t("addedToLikes"), undo: t("undo") },
        );
      }
    },
    [apply, t],
  );

  const toggleSaved = useCallback(
    (entry: LibraryEntry) => {
      let didSave = false;
      apply((prev) => {
        didSave = !prev.saved.some((e) => cardKey(e) === entry.cardId);
        return { ...prev, saved: toggle(prev.saved, entry, cardKey) };
      });
      // Confirm only on save (not un-save), with an Undo that removes it again.
      if (didSave) {
        toastSaved(
          () =>
            apply((prev) => ({
              ...prev,
              saved: prev.saved.filter((e) => cardKey(e) !== entry.cardId),
            })),
          { message: t("savedToLibrary"), undo: t("undo") },
        );
      }
    },
    [apply, t],
  );

  const toggleBook = useCallback(
    (entry: BookEntry) => {
      let didSave = false;
      apply((prev) => {
        didSave = !prev.books.some((e) => bookKey(e) === entry.bookSlug);
        return { ...prev, books: toggle(prev.books, entry, bookKey) };
      });
      if (didSave) {
        toastSaved(
          () =>
            apply((prev) => ({
              ...prev,
              books: prev.books.filter((e) => bookKey(e) !== entry.bookSlug),
            })),
          { message: t("savedToLibrary"), undo: t("undo") },
        );
      }
    },
    [apply, t],
  );

  const isLiked = useCallback(
    (cardId: string) => state.liked.some((e) => e.cardId === cardId),
    [state.liked],
  );
  const isSaved = useCallback(
    (cardId: string) => state.saved.some((e) => e.cardId === cardId),
    [state.saved],
  );
  const isBookSaved = useCallback(
    (bookSlug: string) => state.books.some((e) => e.bookSlug === bookSlug),
    [state.books],
  );

  return {
    liked: state.liked,
    saved: state.saved,
    books: state.books,
    hydrated,
    isLiked,
    isSaved,
    isBookSaved,
    toggleLiked,
    toggleSaved,
    toggleBook,
  };
}
