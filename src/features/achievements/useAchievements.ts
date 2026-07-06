"use client";

import { useMemo } from "react";
import { useStreak } from "@/features/streak";
import { ACHIEVEMENTS, type Achievement } from "./data";

export interface AchievementState extends Achievement {
  unlocked: boolean;
}

export function useAchievements() {
  const { streak } = useStreak();

  return useMemo(() => {
    const all: AchievementState[] = ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: Boolean(a.base) || (a.unlockAtStreak != null && streak >= a.unlockAtStreak),
    }));
    const unlocked = all.filter((a) => a.unlocked);
    const locked = all.filter((a) => !a.unlocked);
    return { all, unlocked, locked, unlockedCount: unlocked.length, total: all.length };
  }, [streak]);
}
