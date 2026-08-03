"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselProps {
  children: ReactNode;
  prevLabel: string;
  nextLabel: string;
  className?: string;
}

/**
 * Horizontal snap-scroll row for book tiles: swipe on touch, chevrons at `lg`
 * where there's no obvious gesture. Everything stays reachable — the row never
 * truncates its items, it scrolls, however many there are.
 */
export function Carousel({ children, prevLabel, nextLabel, className }: CarouselProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
  }, []);

  // Items arrive after hydration (localStorage / API), and the viewport can
  // change under us — recheck on both rather than only on mount.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [sync, children]);

  const page = (direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * el.clientWidth * 0.85,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const arrow =
    "border-hairline bg-surface text-ink shadow-lift absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border transition disabled:pointer-events-none disabled:opacity-0 hover:bg-lavender lg:grid";

  /**
   * Softens whichever edge still has content behind it, so the row reads as
   * "there's more this way" instead of "the card is cut off". A mask rather
   * than a gradient overlay: it works on any background, and no edge is faded
   * when there's nothing to scroll to (the first card's ring must stay crisp).
   */
  const stop = "2.5rem";
  const mask = `linear-gradient(to right, ${[
    canPrev ? `transparent 0, #000 ${stop}` : "#000 0",
    canNext ? `#000 calc(100% - ${stop}), transparent 100%` : "#000 100%",
  ].join(", ")})`;

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={sync}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className={cn(
          // The scroller's own padding is what keeps hover scale, shadows and
          // the selected ring from being clipped — an overflow-x container
          // clips on every side, not just horizontally.
          "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 py-2",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-3 lg:scroll-px-3 lg:px-3",
          className,
        )}
      >
        {children}
      </div>

      <button
        type="button"
        aria-label={prevLabel}
        disabled={!canPrev}
        onClick={() => page(-1)}
        className={cn(arrow, "-left-4")}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        aria-label={nextLabel}
        disabled={!canNext}
        onClick={() => page(1)}
        className={cn(arrow, "-right-4")}
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
