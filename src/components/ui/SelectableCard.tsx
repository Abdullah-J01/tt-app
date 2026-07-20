import { Button } from "@/components/ui/Button";
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
    <Button
      unstyled
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={ariaLabel}
      className={cn(
        "relative flex w-full p-4 text-left",
        selectableSurface(selected),
        isHorizontal
          ? "items-center gap-3.5"
          : cn(
              "flex-col items-center gap-1.5 text-center sm:gap-2.5",
              selected ? "text-violet" : "text-ink",
            ),
        className,
      )}
    >
      {media && (
        <span
          className={cn(
            "flex shrink-0",
            // Vertical tiles come in threes on a phone — a smaller glyph there keeps
            // the tile short so long lists need less scrolling.
            isHorizontal
              ? "[&_svg]:h-7 [&_svg]:w-7"
              : "[&_svg]:h-6 [&_svg]:w-6 sm:[&_svg]:h-7 sm:[&_svg]:w-7",
          )}
        >
          {media}
        </span>
      )}

      {/* Vertical tiles centre their content, so the label would otherwise size to
          max-content and spill past the padding — `w-full` bounds it so the
          wrap/hyphenation rules below can actually engage. */}
      <span className={cn("min-w-0", isHorizontal ? "flex-1" : "w-full")}>
        <span
          className={cn(
            "block leading-tight",
            isHorizontal
              ? "font-display text-ink text-[15px] font-semibold"
              : // 11px on a phone keeps the longest single-word labels
                // ("Entrepreneurship") inside the tile instead of bleeding past the
                // padding. `hyphens-auto` (locale-aware — <html lang> is set) breaks
                // words like "Предпринимательство" at syllables; `break-words` is the
                // last-resort backstop when there's no hyphenation dictionary.
                "text-[11px] font-semibold break-words hyphens-auto sm:text-[13px]",
            emphasizeTitle && "text-base",
          )}
        >
          {title}
        </span>
        {subtitle && <span className="text-muted mt-0.5 block text-xs">{subtitle}</span>}
      </span>

      {showCheck && (
        <CheckCircle2
          className={cn(
            "text-violet h-5 w-5 shrink-0",
            resolvedCheck === "corner" ? "absolute top-2 right-2" : "ml-auto",
          )}
          aria-hidden
        />
      )}
    </Button>
  );
}
