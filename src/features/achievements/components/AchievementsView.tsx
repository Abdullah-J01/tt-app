"use client";

import { useAchievements } from "../useAchievements";
import { AchievementBadge } from "./AchievementBadge";
import { BackButton } from "@/components/layout/BackButton";
import { Container } from "@/components/ui";

export function AchievementsView() {
  const { unlocked, locked, unlockedCount, total } = useAchievements();

  return (
    <Container className="max-w-2xl pb-24 md:pb-12">
      <div className="flex items-center gap-2 pt-4">
        <BackButton fallbackHref="/profile" label="" />
        <h1 className="text-2xl font-bold">Achievements</h1>
        <span className="text-muted ml-auto text-sm font-medium">
          {unlockedCount} / {total} unlocked
        </span>
      </div>

      {unlocked.length > 0 && (
        <section className="mt-6">
          <h2 className="text-muted mb-3 text-sm font-semibold">Unlocked</h2>
          <div className="grid grid-cols-2 gap-3">
            {unlocked.map((b) => (
              <AchievementBadge key={b.id} badge={b} />
            ))}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section className="mt-8">
          <h2 className="text-muted mb-3 text-sm font-semibold">Locked</h2>
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
