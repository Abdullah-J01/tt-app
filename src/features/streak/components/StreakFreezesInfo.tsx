"use client";

import { Star } from "lucide-react";
import { MAX_FREEZES, useStreak } from "../useStreak";

export function StreakFreezesInfo() {
  const { freezes } = useStreak();

  return (
    <div>
      <p className="text-muted text-sm leading-relaxed">
        Freezes are used to <strong className="text-ink">recover your lost streak</strong>.
      </p>
      <p className="text-muted mt-3 text-sm leading-relaxed">
        When you have more than the number of days you missed, they will be{" "}
        <strong className="text-ink">automatically used</strong> to restore your streak.
      </p>
      <p className="text-muted mt-3 text-sm leading-relaxed">
        You can have up to <strong className="text-ink">{MAX_FREEZES} streaks</strong> at a time.
      </p>

      <div className="mt-6 flex flex-col items-center gap-1">
        <span className="text-ink flex items-center gap-2 text-3xl font-bold">
          <Star size={28} className="text-violet" fill="currentColor" />
          {freezes}
        </span>
        <span className="text-muted text-sm">freezes</span>
      </div>

      <div className="bg-violet-tint mt-6 flex items-center gap-3 rounded-2xl p-4">
        <span className="bg-violet rounded-md px-2.5 py-1 text-xs font-bold tracking-wide text-white">
          PRO
        </span>
        <p className="text-violet-dark text-sm leading-snug">
          You get <strong>2 freezes</strong> / week &amp; through streak challenges.
        </p>
      </div>
    </div>
  );
}
