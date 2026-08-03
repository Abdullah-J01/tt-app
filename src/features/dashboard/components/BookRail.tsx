"use client";

import type { ReactNode } from "react";
import { useTranslations } from "@/i18n/client";
import { Carousel } from "./Carousel";
import { RailEmpty, RailSkeleton, TILE_WIDTH } from "./RailStates";
import { SectionHeader } from "./SectionHeader";

interface BookRailProps<T> {
  title: string;
  description?: string;
  icon?: ReactNode;
  iconVariant?: "grey" | "violet" | "green" | "amber";
  seeAllHref?: string;
  seeAllLabel?: string;
  items: T[];
  itemKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** Overrides the header count, which defaults to `items.length`. */
  count?: number;
  /** Renders placeholder tiles instead of the empty state while data loads. */
  loading?: boolean;
  /** Omit to render nothing (rather than an empty state) when `items` is empty. */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  emptyAction?: ReactNode;
}

/**
 * One Home row: SectionHeader over a carousel of tiles. Every item stays
 * reachable by scrolling, so a row with 20 books is as usable as one with 3.
 */
export function BookRail<T>({
  title,
  description,
  icon,
  iconVariant,
  seeAllHref,
  seeAllLabel,
  items,
  itemKey,
  renderItem,
  count,
  loading,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
}: BookRailProps<T>) {
  const t = useTranslations("app_app_home_page");
  const isEmpty = items.length === 0;
  if (!loading && isEmpty && !emptyTitle) return null;

  return (
    <section>
      <SectionHeader
        title={title}
        description={description}
        icon={icon}
        iconVariant={iconVariant}
        count={loading ? undefined : (count ?? items.length)}
        seeAllHref={!isEmpty && !loading ? seeAllHref : undefined}
        seeAllLabel={seeAllLabel}
      />

      {loading ? (
        <RailSkeleton />
      ) : isEmpty ? (
        <RailEmpty
          icon={emptyIcon}
          title={emptyTitle ?? title}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <Carousel prevLabel={t("railPrev")} nextLabel={t("railNext")} className="mt-4">
          {items.map((item) => (
            <div key={itemKey(item)} className={`${TILE_WIDTH} snap-start`}>
              {renderItem(item)}
            </div>
          ))}
        </Carousel>
      )}
    </section>
  );
}
