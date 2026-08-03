import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

/** Tile width per breakpoint — one source of truth for tiles and placeholders. */
export const TILE_WIDTH = "w-[46%] shrink-0 sm:w-[30%] lg:w-[22%]";

/** Placeholder tiles that hold the row's shape while its data loads. */
export function RailSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="mt-4 flex gap-4 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(TILE_WIDTH, "bg-mist aspect-[7/10] animate-pulse rounded-2xl")}
        />
      ))}
    </div>
  );
}

/**
 * Bounded panel for an empty row — never a full-width hole in the page. The
 * min-height is what lets two of these sit side by side (a brand-new account
 * has both Continue and Your Library empty) without one box out-growing the
 * other; `place-items-center` keeps the content centred as it stretches.
 */
export function RailEmpty({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-hairline bg-lavender-soft rounded-card mt-4 grid min-h-[12rem] grow place-items-center border border-dashed sm:min-h-[14rem]">
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        action={action}
        className="px-5 py-7"
      />
    </div>
  );
}
