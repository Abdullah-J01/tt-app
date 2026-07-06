"use client";

import { Star } from "lucide-react";
import { STREAK_MILESTONE_DETAILS, useStreak } from "../useStreak";
import { StreakFlame } from "./StreakFlame";

export function StreakMilestones() {
  const { streak, nextMilestone, daysToNext } = useStreak();

  return (
    <div>
      <p className="text-muted text-sm leading-relaxed">
        Streak milestones earn you <strong className="text-ink">exclusive rewards</strong>. Losing
        your streak resets the challenge and your rewards.
      </p>
      <p className="text-muted mt-3 text-sm leading-relaxed">
        You also get <strong className="text-ink">extra freezes</strong> upon reaching a milestone.
      </p>

      <ul className="mt-6 space-y-6">
        {STREAK_MILESTONE_DETAILS.map((m, i) => {
          const reached = streak >= m.days;
          return (
            <li key={m.days} className="relative flex items-start gap-4">
              {i < STREAK_MILESTONE_DETAILS.length - 1 && (
                <span className="bg-amber/50 absolute top-11 left-[21px] h-[calc(100%+0.6rem)] w-0.5" />
              )}
              <StreakFlame size={44} lit={reached} className="relative z-10" />
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-ink text-lg font-bold">{m.days}-Day Streak</span>
                  <span className="text-ink flex items-center gap-1 font-semibold">
                    <Star size={18} className="text-violet" fill="currentColor" />+{m.freezes}
                  </span>
                </div>
                {m.badge && (
                  <p className="text-muted mt-0.5 text-sm">
                    Unlocks <strong className="text-ink">{m.badge}</strong> Profile Badge
                  </p>
                )}
                {m.reachPct != null && (
                  <p className="text-faint mt-0.5 text-sm">{m.reachPct}% reach this</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {nextMilestone && (
        <p className="text-ink mt-6 text-base">
          You have <strong>{daysToNext} {daysToNext === 1 ? "day" : "days"}</strong> until the next
          reward.
        </p>
      )}
    </div>
  );
}
