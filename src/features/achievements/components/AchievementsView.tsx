"use client";

import { useTranslations } from "@/i18n/client";
import { useAchievements } from "../useAchievements";
import { AchievementBadge } from "./AchievementBadge";
import { BackButton } from "@/components/layout/BackButton";
import { Container } from "@/components/ui";

export function AchievementsView() {
  const t = useTranslations("features_achievements_components_AchievementsView");
  const { unlocked, locked, unlockedCount, total } = useAchievements();

  return (
    <Container className="max-w-2xl pb-24 md:pb-12">
      <div className="flex items-center gap-2 pt-4">
        <BackButton fallbackHref="/profile" label="" />
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <span className="text-muted ml-auto text-sm font-medium">
          {t("unlockedCount", { unlocked: unlockedCount, total })}
        </span>
      </div>

      {unlocked.length > 0 && (
        <section className="mt-6">
          <h2 className="text-muted mb-3 text-sm font-semibold">{t("unlockedHeading")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {unlocked.map((b) => (
              <AchievementBadge key={b.id} badge={b} />
            ))}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section className="mt-8">
          <h2 className="text-muted mb-3 text-sm font-semibold">{t("lockedHeading")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {locked.map((b) => (
              <AchievementBadge key={b.id} badge={b} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
