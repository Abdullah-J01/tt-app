"use client";

import { useTranslations } from "@/i18n/client";
import { Star } from "lucide-react";
import { STREAK_MILESTONE_DETAILS, useStreak } from "../useStreak";
import { StreakFlame } from "./StreakFlame";

export function StreakMilestones() {
  const { streak, nextMilestone, daysToNext } = useStreak();
  const t = useTranslations("features_streak_components_StreakMilestones");

  return (
    <div>
      <p className="text-muted text-sm leading-relaxed">
        {t.rich("intro", { strong: (chunks) => <strong className="text-ink">{chunks}</strong> })}
      </p>
      <p className="text-muted mt-3 text-sm leading-relaxed">
        {t.rich("extraFreezes", {
          strong: (chunks) => <strong className="text-ink">{chunks}</strong>,
        })}
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
                  <span className="text-ink text-lg font-bold">{t("dayStreak", { days: m.days })}</span>
                  <span className="text-ink flex items-center gap-1 font-semibold">
                    <Star size={18} className="text-violet" fill="currentColor" />+{m.freezes}
                  </span>
                </div>
                {m.badge && (
                  <p className="text-muted mt-0.5 text-sm">
                    {t.rich("unlocksBadge", {
                      badge: m.badge,
                      strong: (chunks) => <strong className="text-ink">{chunks}</strong>,
                    })}
                  </p>
                )}
                {m.reachPct != null && (
                  <p className="text-faint mt-0.5 text-sm">{t("reachPct", { pct: m.reachPct })}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {nextMilestone && (
        <p className="text-ink mt-6 text-base">
          {t.rich("untilNext", {
            days: daysToNext,
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
      )}
    </div>
  );
}
