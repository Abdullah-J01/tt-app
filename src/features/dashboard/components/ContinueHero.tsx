"use client";

import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "@/i18n/Link";
import { useTranslations } from "@/i18n/client";
import { useSubjectName } from "@/i18n/useSubjectName";
import { Button } from "@/components/ui/Button";

interface ContinueHeroProps {
  title: string;
  author: string;
  subjectSlug: string;
  cover?: string;
  /** 0-100. */
  progressPct: number;
  /** 1-based, for display only. */
  chapter: number;
  card: number;
  totalCards: number;
  href: string;
}

/**
 * The single most-recent in-progress book, promoted out of the Continue rail
 * into the page's anchor: cover, position in the book, and one obvious way
 * back in. A lone tile in a 4-up grid read as a layout bug — this is the row's
 * whole point, so it gets the width.
 */
export function ContinueHero({
  title,
  author,
  subjectSlug,
  cover,
  progressPct,
  chapter,
  card,
  totalCards,
  href,
}: ContinueHeroProps) {
  const t = useTranslations("app_app_home_page");
  const subjectName = useSubjectName();
  const pct = Math.min(100, Math.max(0, Math.round(progressPct)));

  // No key / entrance animation on this card: picking another book swaps its
  // *content*, it doesn't replace the card. Remounting made it blink on every
  // selection.
  return (
    <div className="border-hairline bg-surface shadow-soft rounded-card relative overflow-hidden border">
      <div
        aria-hidden
        className="from-lavender pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l to-transparent opacity-60"
      />

      <div className="relative flex items-center gap-4 p-4 sm:gap-6 sm:p-5">
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden
          className="bg-plum shadow-soft relative aspect-[7/10] w-20 shrink-0 overflow-hidden rounded-xl sm:w-28"
        >
          {cover ? (
            <Image src={cover} alt="" fill sizes="120px" className="object-cover" />
          ) : (
            <BookOpen className="absolute inset-0 m-auto h-8 w-8 text-white/25" />
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <span className="text-violet bg-lavender inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
            {subjectName(subjectSlug)}
          </span>

          <h3 className="text-ink font-display mt-2 line-clamp-2 text-lg leading-tight font-bold tracking-tight sm:text-xl">
            {title}
          </h3>
          <p className="text-muted mt-0.5 truncate text-sm">{author}</p>

          <div className="mt-3 max-w-md">
            <div className="text-muted flex items-baseline justify-between gap-2 text-xs font-medium">
              <span className="text-ink font-semibold tabular-nums">
                {t("heroProgress", { pct })}
              </span>
              <span className="truncate tabular-nums">
                {t("heroPosition", { chapter, card, total: totalCards })}
              </span>
            </div>
            <div className="bg-mist mt-1.5 h-2 w-full overflow-hidden rounded-full">
              <div
                className="from-violet to-violet-light h-full rounded-full bg-gradient-to-r transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <Link href={href} className="mt-4 hidden sm:inline-block">
            <Button size="sm" trailingIcon={<ArrowRight className="h-4 w-4" />}>
              {t("heroCta")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-4 pb-4 sm:hidden">
        <Link href={href} className="block">
          <Button block size="sm" trailingIcon={<ArrowRight className="h-4 w-4" />}>
            {t("heroCta")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Same box, same proportions, no content — so swapping in the real hero (from
 * localStorage today, from the API later) doesn't move the page under the user.
 */
export function ContinueHeroSkeleton() {
  return (
    <div
      className="border-hairline bg-surface shadow-soft rounded-card overflow-hidden border"
      aria-hidden
    >
      <div className="flex items-center gap-4 p-4 sm:gap-6 sm:p-5">
        <div className="bg-mist aspect-[7/10] w-20 shrink-0 animate-pulse rounded-xl sm:w-28" />
        <div className="min-w-0 flex-1">
          <div className="bg-mist h-4 w-20 animate-pulse rounded-full" />
          <div className="bg-mist mt-3 h-5 w-2/3 animate-pulse rounded-full" />
          <div className="bg-mist mt-2 h-3.5 w-1/3 animate-pulse rounded-full" />
          <div className="bg-mist mt-4 h-2 w-full max-w-md animate-pulse rounded-full" />
          <div className="bg-mist mt-4 hidden h-9 w-40 animate-pulse rounded-full sm:block" />
        </div>
      </div>
      <div className="px-4 pb-4 sm:hidden">
        <div className="bg-mist h-9 w-full animate-pulse rounded-full" />
      </div>
    </div>
  );
}
