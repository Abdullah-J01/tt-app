"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  /** Drawer body — typically a <FilterPanel>. */
  children: ReactNode;
}

/**
 * "Filter materials" drawer shell: bottom sheet on mobile, right side panel on
 * desktop, with a sticky "Show N results" footer. Locks the page scroll behind
 * it while open. Shared by Explore and the subject page.
 */
export function FilterDrawer({ open, onClose, resultCount, children }: FilterDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Filter materials"
    >
      <div className="fade-in absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="drawer-up bg-surface absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-full md:max-w-sm md:rounded-none md:rounded-l-2xl">
        <div className="border-hairline flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-bold">Filters</h2>
          <Button
            unstyled
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="hover:bg-lavender grid h-9 w-9 place-items-center rounded-full active:scale-95"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">{children}</div>
        <div className="border-hairline border-t p-4">
          <Button
            unstyled
            type="button"
            onClick={onClose}
            className="bg-violet hover:bg-violet-dark h-11 w-full rounded-xl font-semibold text-white transition-transform active:scale-[0.98]"
          >
            Show {resultCount} results
          </Button>
        </div>
      </div>
    </div>
  );
}
