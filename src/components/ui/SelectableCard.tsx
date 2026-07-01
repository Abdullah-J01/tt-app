import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Shared selected-state surface (lavender fill + violet border) used by every
 * selectable tile. Reuse this for new selectable surfaces instead of re-deriving it.
 */
export function selectableSurface(selected: boolean) {
  return cn(
    "rounded-2xl border-[1.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/40",
    selected ? "border-violet bg-lavender" : "border-hairline bg-surface hover:border-violet/40",
  );
}

type Orientation = "horizontal" | "vertical";
type Check = "corner" | "trailing" | "none";

interface SelectableCardProps {
  title: string;
  selected: boolean;
  onSelect: () => void;
  /** horizontal = icon-badge + text row (grade); vertical = stacked icon + label (interest). */
  orientation?: Orientation;
  subtitle?: string;
  /** Leading (horizontal) / top (vertical) visual — an icon or an `<IconBadge>`. */
  media?: ReactNode;
  /** Check indicator placement; defaults from orientation (h → trailing, v → corner). */
  check?: Check;
  /** Larger, display-font title. */
  emphasizeTitle?: boolean;
  className?: string;
  /** Accessible name when the visible title isn't sufficient. */
  ariaLabel?: string;
}

/**
 * One selectable tile for grade (horizontal) and interest (vertical) — layout
 * driven by props. Renders a real `<button>` for free keyboard + focus handling.
 */
export function SelectableCard({
  title,
  selected,
  onSelect,
  orientation = "vertical",
  subtitle,
  media,
  check,
  emphasizeTitle = false,
  className,
  ariaLabel,
}: SelectableCardProps) {
  const isHorizontal = orientation === "horizontal";
  const resolvedCheck = check ?? (isHorizontal ? "trailing" : "corner");
  const showCheck = selected && resolvedCheck !== "none";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={ariaLabel}
      className={cn(
        "relative flex w-full p-4 text-left",
        selectableSurface(selected),
        isHorizontal
          ? "items-center gap-3.5"
          : cn("flex-col items-center gap-2.5 text-center", selected ? "text-violet" : "text-ink"),
        className,
      )}
    >
      {media && <span className="flex shrink-0 [&_svg]:h-7 [&_svg]:w-7">{media}</span>}

      <span className={cn("min-w-0", isHorizontal && "flex-1")}>
        <span
          className={cn(
            "block leading-tight",
            isHorizontal
              ? "font-display text-[15px] font-semibold text-ink"
              : "text-[13px] font-semibold",
            emphasizeTitle && "text-base",
          )}
        >
          {title}
        </span>
        {subtitle && <span className="mt-0.5 block text-xs text-muted">{subtitle}</span>}
      </span>

      {showCheck && (
        <CheckCircle2
          className={cn(
            "h-5 w-5 shrink-0 text-violet",
            resolvedCheck === "corner" ? "absolute right-2 top-2" : "ml-auto",
          )}
          aria-hidden
        />
      )}
    </button>
  );
}
