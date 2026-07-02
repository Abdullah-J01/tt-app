"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type Sort = "popular" | "newest" | "az";

export const SORTS: { key: Sort; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "newest", label: "Newest" },
  { key: "az", label: "A–Z" },
];

/** Order studybooks by the given sort (returns a new array). */
export function sortBooks<T extends { title: string; year: number; cards: unknown[] }>(
  books: T[],
  sort: Sort,
): T[] {
  const sorted = [...books];
  if (sort === "popular") sorted.sort((a, b) => b.cards.length - a.cards.length);
  if (sort === "newest") sorted.sort((a, b) => b.year - a.year);
  if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
  return sorted;
}

/** Pill-style sort dropdown shared by the Explore and subject toolbars. */
export function SortMenu({ sort, onChange }: { sort: Sort; onChange: (sort: Sort) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-9 items-center gap-1 rounded-full border border-hairline px-3 text-sm font-medium hover:bg-lavender"
      >
        {SORTS.find((s) => s.key === sort)?.label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <ul className="pop-in absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-card border border-hairline bg-surface py-1 shadow-soft">
            {SORTS.map((s) => (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(s.key);
                    setOpen(false);
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
  );
}
