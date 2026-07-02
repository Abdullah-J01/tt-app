"use client";

import { useEffect } from "react";
import { Flame, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const DAYS = [true, true, true, true, true, true, true];

/** Celebratory streak overlay (UI: Streak moment). */
export function StreakMoment({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="bg-plum fixed inset-0 z-50 flex flex-col text-white"
      role="dialog"
      aria-modal="true"
    >
      <Button
        unstyled
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <span className="animate-floaty from-amber grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br to-orange-500 text-white shadow-[0_0_60px_rgba(244,169,59,0.6)]">
          <Flame className="h-14 w-14" />
        </span>
        <h2 className="mt-8 text-3xl font-bold text-white">7-day streak!</h2>
        <p className="mt-2 max-w-xs text-white/70">
          You&apos;ve learned something new seven days in a row. Keep the fire going.
        </p>

        <div className="mt-6 flex gap-2">
          {DAYS.map((on, i) => (
            <span
              key={i}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full",
                on ? "bg-amber text-white" : "bg-white/10 text-white/40",
              )}
            >
              <Flame className="h-4 w-4" />
            </span>
          ))}
        </div>
      </div>

      <div className="p-6">
        <Button
          unstyled
          type="button"
          onClick={onClose}
          className="text-ink h-13 w-full rounded-xl bg-white font-semibold transition-transform hover:bg-white/90 active:scale-[0.99]"
        >
          Keep it going
        </Button>
      </div>
    </div>
  );
}
