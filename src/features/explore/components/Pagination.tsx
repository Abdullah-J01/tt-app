"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Page numbers to render: first/last + a window around the current page. */
function pageItems(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const shown = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  return shown.flatMap((p, i) => {
    const prev = shown[i - 1];
    if (prev == null) return [p];
    if (p - prev === 2) return [prev + 1, p]; // a single hidden page — just show it
    if (p - prev > 2) return ["gap" as const, p];
    return [p];
  });
}

/** Numbered pager shown under the results grid. */
export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Results pages"
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      <PagerButton label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </PagerButton>

      {pageItems(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="text-faint px-1 text-sm" aria-hidden>
            …
          </span>
        ) : (
          <Button
            unstyled
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              "grid h-9 min-w-9 place-items-center rounded-full px-1 text-sm font-semibold transition-all active:scale-95",
              item === page
                ? "pill-in bg-violet shadow-soft text-white"
                : "text-ink hover:bg-lavender",
            )}
          >
            {item}
          </Button>
        ),
      )}

      <PagerButton
        label="Next page"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </PagerButton>
    </nav>
  );
}

function PagerButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      unstyled
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "border-hairline grid h-9 w-9 place-items-center rounded-full border transition-colors active:scale-95",
        disabled ? "text-faint cursor-default" : "text-ink hover:border-violet hover:bg-lavender",
      )}
    >
      {children}
    </Button>
  );
}
