"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filter materials">
      <div className="fade-in absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="drawer-up absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-surface md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-full md:max-w-sm md:rounded-none md:rounded-l-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <h2 className="text-lg font-bold">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-lavender active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">{children}</div>
        <div className="border-t border-hairline p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-xl bg-violet font-semibold text-white transition-transform hover:bg-violet-dark active:scale-[0.98]"
          >
            Show {resultCount} results
          </button>
        </div>
      </div>
    </div>
  );
}
