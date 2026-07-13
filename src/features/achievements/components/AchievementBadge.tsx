"use client";

import { useTranslations } from "@/i18n/client";
import type { AchievementState } from "../useAchievements";

export function AchievementBadge({ badge }: { badge: AchievementState }) {
  const t = useTranslations("features_achievements_data");
  const { id, unlocked, color, emoji } = badge;

  return (
    <div className="bg-mist/40 flex flex-col items-center rounded-2xl p-4 text-center">
      <span
        className="grid h-24 w-24 place-items-center rounded-full text-4xl shadow-sm"
        style={{
          background: unlocked
            ? `radial-gradient(circle at 50% 35%, ${color}33 0%, ${color}22 60%, ${color}11 100%)`
            : "var(--color-mist)",
          filter: unlocked ? "none" : "grayscale(1)",
          opacity: unlocked ? 1 : 0.55,
        }}
      >
        {emoji}
      </span>
      <h3 className="text-ink mt-3 font-bold">{t(`${id}_title`)}</h3>
      <p className="text-muted mt-1 line-clamp-2 text-sm">{t(`${id}_desc`)}</p>
    </div>
  );
}
