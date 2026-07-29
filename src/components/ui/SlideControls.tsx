"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const CHEVRON =
  "grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25 disabled:opacity-30";

export interface SlideControlsProps {
  /** Current slide, 0-based — Prev is disabled on the first unless `disablePrev` says otherwise. */
  index: number;
  onPrev: () => void;
  onNext: () => void;
  /**
   * Override for when the first slide still has somewhere to go back to — the
   * reader's card 1 of chapter 2 steps back into chapter 1. Defaults to
   * `index === 0`.
   */
  disablePrev?: boolean;
  /** Caller-owned copy, so this stays out of any one i18n namespace. */
  labels: { previous: string; next: string; hint: string };
  /**
   * Disable Next on the last slide. Off by default: callers that *finish* on
   * Next (the reader's streak completion) need it live all the way through.
   */
  disableNext?: boolean;
  /**
   * Short label beside the Next chevron, for when Next stops meaning "one more of
   * the same" — the reader shows the next chapter's name on the last card of a
   * chapter. Touch never sees the chevrons, so that surface says it via `labels.hint`.
   */
  nextHint?: string;
  /** Positioning — absolute inside the reader's card, a flex child in the preview. */
  className?: string;
}

/**
 * Bottom slide controls shared by StudybookReader and StudybookPreview: a swipe
 * hint on touch, Prev/Next chevrons from `lg` up. Exactly one is ever rendered
 * (the other is `display:none`, so it's out of the a11y tree too), which is why
 * both the hint and the Next chevron can carry the same label.
 */
export function SlideControls({
  index,
  onPrev,
  onNext,
  labels,
  disablePrev = index === 0,
  disableNext = false,
  nextHint,
  className,
}: SlideControlsProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Touch: the swipe does the work, so this is a hint — still tappable. */}
      <button
        type="button"
        onClick={onNext}
        aria-label={labels.next}
        className="flex w-full flex-col items-center gap-1 text-white/60 lg:hidden"
      >
        <motion.span
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronUp className="h-5 w-5" />
        </motion.span>
        <span className="text-xs font-medium">{labels.hint}</span>
      </button>

      {/* Desktop: no swipe to lean on, so real buttons. */}
      <div className="hidden w-full items-center justify-between lg:flex">
        <button
          type="button"
          onClick={onPrev}
          disabled={disablePrev}
          aria-label={labels.previous}
          className={CHEVRON}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          {nextHint && (
            <span className="truncate text-xs font-medium text-white/60">{nextHint}</span>
          )}
          <button
            type="button"
            onClick={onNext}
            disabled={disableNext}
            aria-label={labels.next}
            className={CHEVRON}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
