"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { applyFilters } from "../filters";
import { ActiveFilters } from "./ActiveFilters";
import { CoverCard } from "./CoverCard";
import { FilterDrawer } from "./FilterDrawer";
import { FilterPanel } from "./FilterPanel";
import { SortMenu, sortBooks, type Sort } from "./SortMenu";
import { Button } from "@/components/ui/Button";
import type { Studybook } from "@/types";

/**
 * Studybook results for a subject. A filter icon opens the "Filter materials"
 * drawer (bottom sheet on mobile, side panel on desktop); the shared catalog
 * facets filter the grid and a sort control orders it.
 */
export function SubjectBooks({ books }: { books: Studybook[] }) {
  const [sort, setSort] = useState<Sort>("popular");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const visible = useMemo(
    () => sortBooks(applyFilters(books, selected), sort),
    [books, selected, sort],
  );

  return (
    <div className="mt-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted text-sm">
          {visible.length} {visible.length === 1 ? "studybook" : "studybooks"}
        </p>

        <div className="flex items-center gap-2">
          {/* Filter icon → opens drawer */}
          <Button
            unstyled
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-label="Filter materials"
            className="border-hairline hover:border-violet hover:bg-lavender flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium active:scale-95"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {selected.size > 0 && (
              <span
                key={selected.size}
                className="pill-in bg-violet grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs font-semibold text-white"
              >
                {selected.size}
              </span>
            )}
          </Button>

          <SortMenu sort={sort} onChange={setSort} />
        </div>
      </div>

      <ActiveFilters selected={selected} onToggle={toggle} onClear={() => setSelected(new Set())} />

      {/* Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.length === 0 ? (
          <p className="text-muted col-span-full">No studybooks for this filter yet.</p>
        ) : (
          visible.map((b) => <CoverCard key={b.id} book={b} />)
        )}
      </div>

      {/* Filter drawer */}
      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        resultCount={visible.length}
      >
        <FilterPanel
          resultCount={visible.length}
          selected={selected}
          onToggle={toggle}
          onClear={() => setSelected(new Set())}
        />
      </FilterDrawer>
    </div>
  );
}
