import { cn } from "@/lib/utils";

interface ProgressDotsProps {
  total: number;
  /** Zero-based index of the active step. */
  current: number;
  className?: string;
}

/**
 * Segmented step indicator — the active dot elongates into a violet pill.
 * Decorative: the textual "Step X of Y" carries the status for screen readers.
 */
export function ProgressDots({ total, current, className }: ProgressDotsProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-2 rounded-full transition-all",
            i === current ? "w-6 bg-violet" : "w-2 bg-hairline",
          )}
        />
      ))}
    </div>
  );
}
