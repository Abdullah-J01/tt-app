"use client";

import { useEffect } from "react";
import { Flame, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useStreak } from "@/features/streak";

/** Celebratory streak overlay (UI: Streak moment). */
export function StreakMoment({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { streak } = useStreak();
  const DAYS = Array.from({ length: 7 }, (_, i) => i < streak);

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
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
      <div className="fade-in absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="anim-pop bg-plum relative flex w-full max-w-sm flex-col items-center rounded-3xl px-6 py-9 text-center text-white shadow-xl">
        <Button
          unstyled
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 active:scale-90"
        >
          <X className="h-5 w-5" />
        </Button>

        <span className="animate-floaty from-amber grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br to-orange-500 text-white shadow-[0_0_60px_rgba(244,169,59,0.6)]">
          <Flame className="h-14 w-14" />
        </span>
        <h2 className="mt-8 text-3xl font-bold text-white">{streak}-day streak!</h2>
        <p className="mt-2 max-w-xs text-white/70">
          You&apos;ve learned something new {streak} {streak === 1 ? "day" : "days"} in a row. Keep
          the fire going.
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

        <Button
          unstyled
          type="button"
          onClick={onClose}
          className="text-ink mt-8 w-full rounded-xl bg-white py-3.5 font-semibold transition-transform hover:bg-white/90 active:scale-[0.99]"
        >
          Keep it going
        </Button>
      </div>
    </div>
  );
}
