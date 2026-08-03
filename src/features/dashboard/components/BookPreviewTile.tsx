"use client";

import Image from "next/image";
import Link from "@/i18n/Link";
import { BookOpen } from "lucide-react";
import { useSubjectName } from "@/i18n/useSubjectName";

interface BookPreviewTileProps {
  slug: string;
  title: string;
  author: string;
  subjectSlug: string;
  cover?: string;
  /** 0-100 — renders a slim progress bar under the tile when set (Continue only). */
  progressPct?: number;
  /** Defaults to the book's detail page; Continue overrides it to resume the reader. */
  href?: string;
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
}: BookPreviewTileProps) {
  const subjectName = useSubjectName();
  return (
    <Link href={href ?? `/studybook/${slug}`} className="group block">
      {/* aspect-[7/10] + rounded-2xl mirror CoverCard exactly — Continue/Your
          Library and Popular/New sit in the same page and must be one shape. */}
      <div className="bg-plum relative aspect-[7/10] overflow-hidden rounded-2xl shadow-soft">
        {cover ? (
          <Image src={cover} alt="" fill sizes="200px" className="object-cover" />
        ) : (
          <BookOpen className="absolute -right-3 -bottom-3 h-24 w-24 text-white/10" aria-hidden />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <span className="absolute top-2.5 left-2.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
          {subjectName(subjectSlug)}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="line-clamp-2 text-sm leading-snug font-semibold text-white">{title}</p>
          <p className="mt-0.5 truncate text-xs text-white/65">{author}</p>
        </div>
      </div>

      {progressPct != null && (
        <div className="bg-mist mt-2 h-1 w-full overflow-hidden rounded-full">
          <div
            className="bg-violet h-full rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
      )}
    </Link>
  );
}
