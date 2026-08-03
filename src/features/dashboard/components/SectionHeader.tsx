import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import Link from "@/i18n/Link";
import { IconBadge } from "@/components/ui/IconBadge";

interface SectionHeaderProps {
  title: string;
  /** One-line "why this row exists" — the sub-line under the title. */
  description?: string;
  /** Optional leading icon; rendered in a tinted badge. */
  icon?: ReactNode;
  iconVariant?: "grey" | "violet" | "green" | "amber";
  /** Item count shown next to the title (omitted when 0/undefined). */
  count?: number;
  seeAllHref?: string;
  seeAllLabel?: string;
}

/**
 * One consistent heading for every Home row: badge + title (+ count) on the
 * left, "See all" on the right. Lives here rather than inside BookRail so the
 * Continue hero can wear the same header as the rails around it.
 */
export function SectionHeader({
  title,
  description,
  icon,
  iconVariant = "violet",
  count,
  seeAllHref,
  seeAllLabel,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <IconBadge icon={icon} variant={iconVariant} size="sm" shape="rounded" />}
        <div className="min-w-0">
          <h2 className="text-ink font-display flex items-baseline gap-2 text-lg font-bold tracking-tight sm:text-xl">
            <span className="truncate">{title}</span>
            {!!count && (
              <span className="text-faint text-sm font-semibold tabular-nums">{count}</span>
            )}
          </h2>
          {/* Wraps rather than truncates: Estonian and Russian run noticeably
              longer than English and would otherwise ellipsis mid-word. */}
          {description && (
            <p className="text-muted mt-0.5 line-clamp-2 text-xs sm:text-sm">{description}</p>
          )}
        </div>
      </div>

      {seeAllHref && (
        <Link
          href={seeAllHref}
          className="text-violet hover:bg-lavender inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-sm font-semibold transition-colors"
        >
          {seeAllLabel}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
