"use client";

import Image from "next/image";
import Link from "@/i18n/Link";
import { BookOpen, Check, Play } from "lucide-react";
import { useSubjectName } from "@/i18n/useSubjectName";
import { cn } from "@/lib/utils";

interface BookPreviewTileProps {
  slug: string;
  title: string;
  author: string;
  subjectSlug: string;
  cover?: string;
  /** 0-100 — renders the progress bar + badge inside the cover (Continue only). */
  progressPct?: number;
  /** Defaults to the book's detail page; Continue overrides it to resume the reader. */
  href?: string;
  /**
   * Turns the tile into a selector button instead of a link — Continue uses it
   * to load the tile into the hero rather than navigating away.
   */
  onSelect?: () => void;
  selected?: boolean;
}

/**
 * Lightweight book tile for Continue / Your Library — these rows render from
 * a saved snapshot (useReadingProgress / useLibrary), not a full Studybook, so
 * this doesn't reuse CoverCard (Explore's richer, full-Studybook tile).
 */
export function BookPreviewTile({
  slug,
  title,
  author,
  subjectSlug,
  cover,
  progressPct,
  href,
  onSelect,
  selected,
}: BookPreviewTileProps) {
  const subjectName = useSubjectName();
  const pct = progressPct == null ? null : Math.min(100, Math.max(0, Math.round(progressPct)));

  const body = (
    /* aspect-[7/10] + rounded-2xl mirror CoverCard exactly — Continue/Your
       Library and Popular/New sit in the same page and must be one shape.
       Progress lives *inside* the cover for the same reason: a bar tacked
       underneath made these tiles taller than the CoverCards beside them.

       Hover scales the whole tile, never the image inside it: a scaled image
       under `overflow-hidden` crops the art and slides out from under the
       badges. Scaling the card keeps cover, tags and progress in proportion,
       and a transform costs no layout, so neighbouring tiles don't shift. */
    <div
      className={cn(
        "bg-plum shadow-soft group-hover:shadow-lift relative aspect-[7/10] overflow-hidden rounded-2xl transition duration-300 group-hover:scale-[1.03]",
        selected && "ring-violet ring-offset-surface ring-2 ring-offset-2",
      )}
    >
      {cover ? (
        <Image src={cover} alt="" fill sizes="200px" className="object-cover" />
      ) : (
        <BookOpen className="absolute -right-3 -bottom-3 h-24 w-24 text-white/10" aria-hidden />
      )}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 transition-opacity duration-300",
          !selected && "group-hover:opacity-80",
        )}
      />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
        <span className="truncate rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
          {subjectName(subjectSlug)}
        </span>
        {pct != null && (
          <span className="bg-violet shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white tabular-nums">
            {pct}%
          </span>
        )}
      </div>

      {selected && (
        <span
          className="bg-violet absolute top-1/2 left-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white shadow-lg"
          aria-hidden
        >
          <Check className="h-5 w-5" />
        </span>
      )}

      {!onSelect && pct != null && (
        <span
          className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        >
          <span className="text-violet shadow-lift grid h-11 w-11 place-items-center rounded-full bg-white/90">
            <Play className="h-5 w-5 translate-x-px fill-current" />
          </span>
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3 text-left">
        <p className="line-clamp-2 text-sm leading-snug font-semibold text-white">{title}</p>
        <p className="mt-0.5 truncate text-xs text-white/65">{author}</p>
        {pct != null && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/25">
            <div className="bg-violet-light h-full rounded-full" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
    </div>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={title}
        className="group focus-visible:ring-violet block w-full rounded-2xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {body}
      </button>
    );
  }

  return (
    <Link href={href ?? `/studybook/${slug}`} className="group block" aria-label={title}>
      {body}
    </Link>
  );
}
