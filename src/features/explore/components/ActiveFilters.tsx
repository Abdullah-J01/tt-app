"use client";

import { X } from "lucide-react";
import { optionLabel } from "../filters";

interface ActiveFiltersProps {
  /** Composite keys "facetKey:value" that are checked. */
  selected: ReadonlySet<string>;
  onToggle: (compositeKey: string) => void;
  onClear: () => void;
}

/** Checked filters as removable pills, popping in as they're added. */
export function ActiveFilters({ selected, onToggle, onClear }: ActiveFiltersProps) {
  if (selected.size === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {[...selected].map((key, i) => (
        <button
          key={key}
          type="button"
          onClick={() => onToggle(key)}
          style={{ animationDelay: `${Math.min(i, 6) * 30}ms` }}
          className="pill-in group flex items-center gap-1.5 rounded-full bg-lavender py-1.5 pl-3 pr-2 text-sm font-medium text-ink transition-colors hover:bg-violet hover:text-white"
        >
          {optionLabel(key)}
          <span className="grid h-4 w-4 place-items-center rounded-full bg-violet/15 transition-colors group-hover:bg-white/20">
            <X className="h-3 w-3" aria-hidden />
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="pill-in text-sm font-semibold text-violet hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
