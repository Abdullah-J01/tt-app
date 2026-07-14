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
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-1.5 text-muted">{t("subtitle")}</p>
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
          <p className="font-display text-[15px] font-semibold text-ink">{t("reminderTitle")}</p>
          <p className="text-xs text-muted">{t("reminderBody")}</p>
        </div>
        <Toggle checked={reminders} onChange={onToggleReminders} label={t("reminderTitle")} />
      </Card>

      <Card className="p-4">
        <StreakCalendar activeDays={activeDays} />
      </Card>
    </div>
  );
}