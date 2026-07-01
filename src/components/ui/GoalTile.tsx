import { cn } from "@/lib/utils";
import { selectableSurface } from "./SelectableCard";

interface GoalTileProps {
  /** The big number (e.g. cards per day). */
  value: number;
  /** Unit label under the number (e.g. "cards / day"). */
  unit: string;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}

/**
 * Number-centric selectable tile (daily goal). Shares the selected-state look with
 * `SelectableCard` via `selectableSurface`, but its own number-first layout.
 */
export function GoalTile({ value, unit, selected, onSelect, className }: GoalTileProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 px-2 py-5",
        selectableSurface(selected),
        selected ? "text-violet" : "text-ink",
        className,
      )}
    >
      <span className="font-display text-3xl font-extrabold leading-none">{value}</span>
      <span className={cn("text-[11px]", selected ? "text-violet" : "text-muted")}>{unit}</span>
    </button>
  );
}
