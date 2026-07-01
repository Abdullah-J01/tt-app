"use client";

import { useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoverCard } from "./CoverCard";
import { FilterPanel } from "./FilterPanel";
import type { Studybook } from "@/types";

type Sort = "popular" | "newest" | "az";

const SORTS: { key: Sort; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "newest", label: "Newest" },
  { key: "az", label: "A–Z" },
];

/** Target Group values that map to a real book grade. */
const GRADE_VALUES = new Set(["preschool", "1-3", "4-6", "7-9", "gymnasium"]);

/**
 * Studybook results for a subject. A filter icon opens the "Filter materials"
 * drawer (bottom sheet on mobile, side panel on desktop); Target Group filters
 * by grade. A sort control orders the grid.
 */
export function SubjectBooks({ books }: { books: Studybook[] }) {
  const [sort, setSort] = useState<Sort>("popular");
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const visible = useMemo(() => {
    const grades = [...selected]
      .filter((k) => k.startsWith("target:"))
      .map((k) => k.slice("target:".length))
      .filter((v) => GRADE_VALUES.has(v));

    const filtered = grades.length ? books.filter((b) => grades.includes(b.grade)) : books;
    const sorted = [...filtered];
    if (sort === "popular") sorted.sort((a, b) => b.cards.length - a.cards.length);
    if (sort === "newest") sorted.sort((a, b) => b.year - a.year);
    if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [books, selected, sort]);

  return (
    <div className="mt-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {visible.length} {visible.length === 1 ? "studybook" : "studybooks"}
        </p>

        <div className="flex items-center gap-2">
          {/* Filter icon → opens drawer */}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-label="Filter materials"
            className="flex h-9 items-center gap-2 rounded-full border border-hairline px-3 text-sm font-medium hover:border-violet hover:bg-lavender active:scale-95"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {selected.size > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-violet px-1 text-xs font-semibold text-white">
                {selected.size}
              </span>
            )}
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex h-9 items-center gap-1 rounded-full border border-hairline px-3 text-sm font-medium hover:bg-lavender"
            >
              {SORTS.find((s) => s.key === sort)?.label}
              <ChevronDown className={cn("h-4 w-4 transition-transform", sortOpen && "rotate-180")} />
            </button>
            {sortOpen && (
              <>
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setSortOpen(false)}
                  className="fixed inset-0 z-10 cursor-default"
                />
                <ul className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-card border border-hairline bg-surface py-1 shadow-soft">
                  {SORTS.map((s) => (
                    <li key={s.key}>
                      <button
                        type="button"
                        onClick={() => {
                          setSort(s.key);
                          setSortOpen(false);
                        }}
                        className={cn(
                          "block w-full px-4 py-2 text-left text-sm hover:bg-lavender",
                          s.key === sort ? "font-semibold text-violet" : "text-ink",
                        )}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.length === 0 ? (
          <p className="col-span-full text-muted">No studybooks for this filter yet.</p>
        ) : (
          visible.map((b) => <CoverCard key={b.id} book={b} />)
        )}
      </div>

      {/* Filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="fade-in absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="drawer-up absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-surface md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-full md:max-w-sm md:rounded-none md:rounded-l-2xl">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <h2 className="text-lg font-bold">Filters</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-lavender active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel
                resultCount={visible.length}
                selected={selected}
                onToggle={toggle}
                onClear={() => setSelected(new Set())}
              />
            </div>
            <div className="border-t border-hairline p-4">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="h-11 w-full rounded-xl bg-violet font-semibold text-white transition-transform hover:bg-violet-dark active:scale-[0.98]"
              >
                Show {visible.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
