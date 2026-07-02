"use client";

import { X } from "lucide-react";
import { optionLabel } from "../filters";
import { Button } from "@/components/ui/Button";

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
        <Button
          unstyled
          key={key}
          type="button"
          onClick={() => onToggle(key)}
          style={{ animationDelay: `${Math.min(i, 6) * 30}ms` }}
          className="pill-in group bg-lavender text-ink hover:bg-violet flex items-center gap-1.5 rounded-full py-1.5 pr-2 pl-3 text-sm font-medium transition-colors hover:text-white"
        >
          {optionLabel(key)}
          <span className="bg-violet/15 grid h-4 w-4 place-items-center rounded-full transition-colors group-hover:bg-white/20">
            <X className="h-3 w-3" aria-hidden />
          </span>
        </Button>
      ))}
      <Button
        unstyled
        type="button"
        onClick={onClear}
        className="pill-in text-violet text-sm font-semibold hover:underline"
      >
        Clear all
      </Button>
    </div>
  );
}
