"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { Card } from "@/components/ui/Card";
import { GoalTile } from "@/components/ui/GoalTile";
import { IconBadge } from "@/components/ui/IconBadge";
import { Toggle } from "@/components/ui/Toggle";
import { StreakCalendar, useStreak } from "@/features/streak";

interface StepDailyGoalProps {
  goals: readonly number[];
  selected: number;
  onSelect: (goal: number) => void;
  reminders: boolean;
  onToggleReminders: (on: boolean) => void;
}

/** Onboarding step 3 — daily goal + reminder opt-in (UI brief §6.1). */
export function StepDailyGoal({
  goals,
  selected,
  onSelect,
  reminders,
  onToggleReminders,
}: StepDailyGoalProps) {
  const t = useTranslations("components_onboarding_StepDailyGoal");
  const { activeDays } = useStreak();
  return (
    <div className="flex flex-col gap-3 sm:gap-5">
      <div>
        <h1 className="font-display text-ink text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="text-muted mt-1 text-sm sm:mt-1.5 sm:text-base">{t("subtitle")}</p>
      </div>

      <div className="flex gap-2.5">
        {goals.map((g) => (
          <GoalTile
            key={g}
            value={g}
            unit={t("unit")}
            selected={selected === g}
            onSelect={() => onSelect(g)}
          />
        ))}
      </div>

      <Card className="flex items-center gap-3.5 p-4">
        <IconBadge icon={<Bell />} variant="amber" />
        <div className="flex-1">
          <p className="font-display text-ink text-[15px] font-semibold">{t("reminderTitle")}</p>
          <p className="text-muted text-xs">{t("reminderBody")}</p>
        </div>
        <Toggle checked={reminders} onChange={onToggleReminders} label={t("reminderTitle")} />
      </Card>

      <Card className="p-4">
        <StreakCalendar activeDays={activeDays} />
      </Card>
    </div>
  );
}
