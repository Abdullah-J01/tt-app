"use client";

import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";
import { useAchievements } from "../useAchievements";

export function AchievementsCard() {
  const { unlocked, unlockedCount, total } = useAchievements();
  const preview = unlocked.slice(0, 4);

  return (
    <Link
      href="/profile/achievements"
      className="border-hairline bg-surface hover:border-violet/40 flex items-center gap-4 rounded-2xl border p-4 transition-colors"
    >
      <span className="bg-lavender text-violet grid h-12 w-12 shrink-0 place-items-center rounded-full">
        <Trophy className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-ink block font-bold">Achievements</span>
        <span className="text-muted block text-sm">
          {unlockedCount} / {total} unlocked
        </span>
        {preview.length > 0 && (
          <span className="mt-1.5 flex -space-x-1.5">
            {preview.map((b) => (
              <span
                key={b.id}
                className="border-surface grid h-7 w-7 place-items-center rounded-full border-2 text-sm"
                style={{ background: `${b.color}22` }}
              >
                {b.emoji}
              </span>
            ))}
          </span>
        )}
      </span>
      <ChevronRight className="text-muted h-5 w-5 shrink-0" />
    </Link>
  );
}
