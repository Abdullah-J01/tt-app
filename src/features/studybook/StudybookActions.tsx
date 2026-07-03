"use client";

import { useState } from "react";
import { Bookmark, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toastSaved } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";

/** Share the current studybook (Web Share API, clipboard fallback). */
export function ShareButton({ title, className }: { title: string; className?: string }) {
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
      aria-label="Share"
      className={cn(
        "text-ink hover:bg-lavender grid h-10 w-10 place-items-center rounded-full active:scale-95",
        className,
      )}
    >
      <Share2 className="h-5 w-5" />
    </Button>
  );
}

/** Save/bookmark toggle. `full` renders a labelled button; otherwise an icon. */
export function SaveButton({ full = false }: { full?: boolean }) {
  const [saved, setSaved] = useState(false);
  const toggle = () => {
    const next = !saved;
    setSaved(next);
    if (next) toastSaved(() => setSaved(false));
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
        {saved ? "Saved" : "Save"}
      </Button>
    );
  }

  return (
    <Button
      unstyled
      type="button"
      onClick={toggle}
      aria-label={saved ? "Saved" : "Save"}
      className="text-ink hover:bg-lavender grid h-10 w-10 place-items-center rounded-full active:scale-95"
    >
      <Bookmark className={cn("h-5 w-5", saved && "text-violet fill-current")} />
    </Button>
  );
}
