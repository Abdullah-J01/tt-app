import { cn } from "@/lib/utils";

interface IllustrationPlaceholderProps {
  /** Short note describing the art that belongs here (swap for real 3D art later). */
  caption?: string;
  className?: string;
}

/**
 * Stand-in for a spot / 3D illustration — a hatched lavender panel. Marked with
 * `data-illustration` so real art can be dropped in without hunting for placeholders.
 */
export function IllustrationPlaceholder({ caption, className }: IllustrationPlaceholderProps) {
  return (
    <div
      data-illustration
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl bg-lavender p-4 text-center",
        className,
      )}
    >
      {/* Decorative diagonal hatch (temporary texture; replaced by real art). */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(108,76,227,0.08) 0 11px, transparent 11px 22px)",
        }}
      />
      {caption && (
        <span className="relative z-10 font-mono text-[11px] leading-relaxed text-violet">
          {caption}
        </span>
      )}
    </div>
  );
}
