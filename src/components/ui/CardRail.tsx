import { Children, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Desktop grid presets, keyed by column count. */
const GRID_COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export interface CardRailProps {
  children: ReactNode;
  /**
   * When set, the rail "un-scrolls" into a grid with this many columns at `md+`.
   * Omit to keep a horizontal scroll rail at every breakpoint.
   */
  columns?: 2 | 3 | 4;
  /** Per-item width on the mobile rail (a Tailwind width utility). */
  itemWidth?: string;
  /** Accessible name for the scroll region. */
  label?: string;
  className?: string;
}

/**
 * Mobile-first horizontal scroll rail with snap + edge-bleed. Pass `columns` to
 * turn it into a plain grid on desktop (matching the "õpiampsud" rows); leave it
 * off to keep scrolling on desktop too (the "digiteeritud" tiles). The card owns
 * no width — each rail item does, so the same `ContentCard` works in both.
 */
export function CardRail({
  children,
  columns,
  itemWidth = "w-[80%] sm:w-72",
  label,
  className,
}: CardRailProps) {
  const asGrid = columns != null;
  return (
    <ul
      aria-label={label}
      className={cn(
        // Mobile rail: horizontal scroll, snap, bleed to the screen edges.
        "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-4 px-4 pb-2",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        // Desktop grid (opt-in): drop the scroll + bleed, lay out in columns.
        asGrid && "md:mx-0 md:grid md:gap-6 md:overflow-visible md:px-0 md:pb-0",
        asGrid && GRID_COLS[columns],
        className,
      )}
    >
      {Children.map(children, (child) => (
        <li
          className={cn(
            "shrink-0 snap-start",
            itemWidth,
            asGrid && "md:w-auto",
          )}
        >
          {child}
        </li>
      ))}
    </ul>
  );
}
