"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IS_DEV_MODE } from "@/lib/env";
import { useUserStorage } from "@/lib/storage";
import type { ProgressEntry, ProgressMap } from "./repository";
import type { Studybook } from "@/types";

export type { ProgressEntry, ProgressMap };

/** What setProgress needs from the book to snapshot into a ProgressEntry. */
type ProgressBook = Pick<
  Studybook,
  "slug" | "title" | "author" | "subjectSlug" | "grade" | "cover"
> & {
  cards: unknown[];
};

const EVENT = "tt:progress";
const EMPTY: ProgressMap = {};
const SAVE_DEBOUNCE_MS = 1000;

function readProgress(key: string): ProgressMap {
  if (!IS_DEV_MODE) return EMPTY;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as ProgressMap) };
  } catch {
    /* ignore corrupt / disabled storage */
  }
  return EMPTY;
}

function writeProgress(key: string, state: ProgressMap): void {
  if (!IS_DEV_MODE) return;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* ignore quota / disabled storage */
  }
  window.dispatchEvent(new Event(EVENT));
}


export function useReadingProgress() {

  const { key, ready, canPersist } = useUserStorage("progress");

  const [progress, setProgressState] = useState<ProgressMap>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // Latest progress for setProgress to read without depending on it directly —
  // depending on `progress` would change setProgress's identity on every call,
  // and callers that put it in a useEffect dependency array would loop.
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
 
    if (!ready) return;

    if (IS_DEV_MODE) {
      setProgressState(readProgress(key));
      setHydrated(true);
      const sync = () => setProgressState(readProgress(key));
      window.addEventListener("storage", sync);
      window.addEventListener(EVENT, sync);
      return () => {
        window.removeEventListener("storage", sync);
        window.removeEventListener(EVENT, sync);
      };
    }

    const controller = new AbortController();
    fetch("/api/progress", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { progress?: ProgressMap } | null) => {
        setProgressState(data?.progress ?? EMPTY);
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
    return () => controller.abort();
  }, [key, ready]);

  const setProgress = useCallback(
    (book: ProgressBook, chapterIndex: number, cardIndex: number, globalIndex: number) => {
      if (!canPersist) return;
      const entry: ProgressEntry = {
        chapterIndex,
        cardIndex,
        globalIndex,
        totalCards: book.cards.length,
        bookTitle: book.title,
        bookAuthor: book.author,
        subject: book.subjectSlug,
        grade: book.grade,
        cover: book.cover,
        updatedAt: Date.now(),
      };
      const next = {
        ...(IS_DEV_MODE ? readProgress(key) : progressRef.current),
        [book.slug]: entry,
      };
      setProgressState(next);

      if (IS_DEV_MODE) {
        writeProgress(key, next);
        return;
      }

      clearTimeout(saveTimers.current[book.slug]);
      saveTimers.current[book.slug] = setTimeout(() => {
        fetch("/api/progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studybookSlug: book.slug, ...entry }),
        }).catch(() => {
          /* best-effort — Continue just falls back to stale progress next load */
        });
      }, SAVE_DEBOUNCE_MS);
    },
    [key, canPersist],
  );

  return { progress, hydrated, setProgress };
}
