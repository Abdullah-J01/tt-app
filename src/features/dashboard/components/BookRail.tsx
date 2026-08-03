import type { ReactNode } from "react";
import Link from "@/i18n/Link";
import { EmptyState } from "@/components/ui/EmptyState";

interface BookRailProps<T> {
  title: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  items: T[];
  itemKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** Omit to render nothing (rather than an empty state) when `items` is empty. */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}

/**
 * One Home row: title (+ optional "See all"), horizontal snap-scroll on
 * mobile / grid at `lg:`, or an EmptyState when there's nothing to show.
 * Shared by Continue, Your Library, Popular and New so the mobile-first
 * scroll behavior only lives in one place.
 */
export function BookRail<T>({
  title,
  seeAllHref,
  seeAllLabel,
  items,
  itemKey,
  renderItem,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: BookRailProps<T>) {
  if (items.length === 0 && !emptyTitle) return null;

  return (
    <section>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-ink text-lg font-bold">{title}</h2>
        {seeAllHref && items.length > 0 && (
          <Link href={seeAllHref} className="text-violet shrink-0 text-sm font-semibold">
            {seeAllLabel}
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState title={emptyTitle ?? title} description={emptyDescription} action={emptyAction} className="mt-1" />
      ) : (
        // Column math is Explore's (grid-cols-2 → sm:grid-cols-3, gap-4), so a
        // card here is the same size as the same card on Explore: 2-up on
        // phones, 3-up on tablets. From lg it becomes a real 4-up grid.
        <div className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {items.map((item) => (
            <div
              key={itemKey(item)}
              className="w-[calc((100%-1rem)/2)] shrink-0 snap-start sm:w-[calc((100%-2rem)/3)] lg:w-full"
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
