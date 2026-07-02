"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { SUBJECTS } from "@/config/subjects";
import { selectableSurface } from "@/components/ui/SelectableCard";
import { cn } from "@/lib/utils";

/** Subjects shown before "See more" folds the rest (vertical rail only). */
const VISIBLE = 12;

interface SubjectRailProps {
  /** Composite keys "facetKey:value" that are checked. */
  selected: ReadonlySet<string>;
  onToggle: (compositeKey: string) => void;
  className?: string;
}

/**
 * Subject picker synced to the "subject" facet: a horizontal scroll rail on
 * mobile/tablet that becomes a sticky vertical column on xl (TT-style middle
 * panel). Rows reuse the shared selectable surface.
 */
export function SubjectRail({ selected, onToggle, className }: SubjectRailProps) {
  const [showAll, setShowAll] = useState(false);
  const hidden = SUBJECTS.length - VISIBLE;

  return (
    <section className={cn("rail-in min-w-0 xl:sticky xl:top-6", className)}>
      <h2 className="text-lg font-bold">Subjects</h2>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-2 xl:mx-0 xl:flex-col xl:gap-1.5 xl:overflow-visible xl:rounded-card xl:border xl:border-hairline xl:bg-surface xl:p-2 xl:pb-2">
        {SUBJECTS.map((subject, i) => {
          const key = `subject:${subject.slug}`;
          const checked = selected.has(key);
          const Icon = subject.icon;
          return (
            <button
              key={subject.slug}
              type="button"
              aria-pressed={checked}
              onClick={() => onToggle(key)}
              style={{ animationDelay: `${100 + Math.min(i, 12) * 45}ms` }}
              className={cn(
                "anim-item-in group flex shrink-0 items-center gap-2.5 px-3 py-2 text-left text-sm",
                selectableSurface(checked),
                !showAll && i >= VISIBLE && "xl:hidden",
                "xl:w-full xl:shrink",
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist transition-colors",
                  checked ? "bg-violet text-white" : subject.color,
                )}
              >
                {checked ? (
                  <Check className="check-pop h-4 w-4" strokeWidth={3} aria-hidden />
                ) : (
                  <Icon className="h-4 w-4" aria-hidden />
                )}
              </span>
              <span className={cn("whitespace-nowrap font-medium text-ink xl:flex-1 xl:truncate", checked && "font-semibold")}>
                {subject.name}
              </span>
              <span className="text-xs tabular-nums text-muted">
                {subject.count.toLocaleString("en-US")}
              </span>
            </button>
          );
        })}

        {/* Fold control — only meaningful in the vertical (xl) rail */}
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="hidden items-center justify-center gap-1 rounded-xl py-2 text-sm font-semibold text-violet transition-colors hover:bg-lavender/40 xl:flex"
        >
          {showAll ? "See less" : `See more (${hidden})`}
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", showAll && "rotate-180")} />
        </button>
      </div>
    </section>
  );
}
