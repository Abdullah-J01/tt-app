"use client";

import { useTranslations } from "@/i18n/client";
import { Star } from "lucide-react";
import { MAX_FREEZES, useStreak } from "../useStreak";

export function StreakFreezesInfo() {
  const { freezes } = useStreak();
  const t = useTranslations("features_streak_components_StreakFreezesInfo");

  return (
    <div>
      <p className="text-muted text-sm leading-relaxed">
        {t.rich("recover", { strong: (chunks) => <strong className="text-ink">{chunks}</strong> })}
      </p>
      <p className="text-muted mt-3 text-sm leading-relaxed">
        {t.rich("automatic", { strong: (chunks) => <strong className="text-ink">{chunks}</strong> })}
      </p>
      <p className="text-muted mt-3 text-sm leading-relaxed">
        {t.rich("maxFreezes", {
          count: MAX_FREEZES,
          strong: (chunks) => <strong className="text-ink">{chunks}</strong>,
        })}
      </p>

      <div className="mt-6 flex flex-col items-center gap-1">
        <span className="text-ink flex items-center gap-2 text-3xl font-bold">
          <Star size={28} className="text-violet" fill="currentColor" />
          {freezes}
        </span>
        <span className="text-muted text-sm">{t("freezesLabel")}</span>
      </div>

      <div className="bg-violet-tint mt-6 flex items-center gap-3 rounded-2xl p-4">
        <span className="bg-violet rounded-md px-2.5 py-1 text-xs font-bold tracking-wide text-white">
          {t("pro")}
        </span>
        <p className="text-violet-dark text-sm leading-snug">
          {t.rich("proInfo", { strong: (chunks) => <strong>{chunks}</strong> })}
        </p>
      </div>
    </div>
  );
}
