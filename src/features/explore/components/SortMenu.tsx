"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n/client";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
  const t = useTranslations("features_explore_components_SortMenu");
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        unstyled
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="border-hairline hover:bg-lavender flex h-9 items-center gap-1 rounded-full border px-3 text-sm font-medium"
      >
        {t(sort)}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </Button>
      {open && (
        <>
          <Button
            unstyled
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <ul className="pop-in rounded-card border-hairline bg-surface shadow-soft absolute right-0 z-20 mt-1 w-36 overflow-hidden border py-1">
            {SORTS.map((s) => (
              <li key={s.key}>
                <Button
                  unstyled
                  type="button"
                  onClick={() => {
                    onChange(s.key);
                    setOpen(false);
                  }}
                  className={cn(
                    "hover:bg-lavender block w-full px-4 py-2 text-left text-sm",
                    s.key === sort ? "text-violet font-semibold" : "text-ink",
                  )}
                >
                  {t(s.key)}
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
