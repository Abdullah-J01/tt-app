"use client";

import { useTranslations } from "@/i18n/client";
import { useAuthGuard } from "@/components/auth/useAuthGuard";
import { Bookmark, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useLibrary } from "@/features/library/useLibrary";
import type { Studybook } from "@/types";

/** Share the current studybook (Web Share API, clipboard fallback). */
export function ShareButton({ title, className }: { title: string; className?: string }) {
  const t = useTranslations("features_studybook_StudybookActions");
  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* dismissed */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* clipboard blocked */
      }
    }
  };

  return (
    <Button
      unstyled
      type="button"
      onClick={share}
      aria-label={t("share")}
      className={cn(
        "text-ink hover:bg-lavender grid h-10 w-10 place-items-center rounded-full active:scale-95",
        className,
      )}
    >
      <Share2 className="h-5 w-5" />
    </Button>
  );
}

/**
 * Save/bookmark toggle for a whole studybook — persists to the library
 * (Studybooks tab). `full` renders a labelled button; otherwise an icon.
 */
export function SaveButton({ book, full = false }: { book: Studybook; full?: boolean }) {
  const t = useTranslations("features_studybook_StudybookActions");
  const { requireAuth } = useAuthGuard();
  const { isBookSaved, toggleBook } = useLibrary();
  const saved = isBookSaved(book.slug);

  const toggle = () => {
    // Saving requires a session — guests get the login popup instead.
    requireAuth(
      () =>
        toggleBook({
          bookSlug: book.slug,
          bookTitle: book.title,
          bookAuthor: book.author,
          subject: book.subjectSlug,
          grade: book.grade,
          cover: book.cover,
          savedAt: 0, // stamped by the store on insert
        }),
      t("loginToSave"),
    );
  };

  if (full) {
    return (
      <Button
        unstyled
        type="button"
        onClick={toggle}
        className={cn(
          "flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors",
          saved
            ? "border-violet bg-lavender text-violet"
            : "border-hairline text-ink hover:bg-lavender",
        )}
      >
        <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
        {saved ? t("saved") : t("save")}
      </Button>
    );
  }

  return (
    <Button
      unstyled
      type="button"
      onClick={toggle}
      aria-label={saved ? t("saved") : t("save")}
      className="text-ink hover:bg-lavender grid h-10 w-10 place-items-center rounded-full active:scale-95"
    >
      <Bookmark className={cn("h-5 w-5", saved && "text-violet fill-current")} />
    </Button>
  );
}
