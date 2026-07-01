import { Bell } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { GoalTile } from "@/components/ui/GoalTile";
import { IconBadge } from "@/components/ui/IconBadge";
import { IllustrationPlaceholder } from "@/components/ui/IllustrationPlaceholder";
import { Toggle } from "@/components/ui/Toggle";

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
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Set a daily goal</h1>
        <p className="mt-1.5 text-muted">Small and steady wins. Change it later.</p>
      </div>

      <div className="flex gap-2.5">
        {goals.map((g) => (
          <GoalTile
            key={g}
            value={g}
            unit="cards / day"
            selected={selected === g}
            onSelect={() => onSelect(g)}
          />
        ))}
      </div>

      <Card className="flex items-center gap-3.5 p-4">
        <IconBadge icon={<Bell />} variant="amber" />
        <div className="flex-1">
          <p className="font-display text-[15px] font-semibold text-ink">Daily reminder</p>
          <p className="text-xs text-muted">A nudge at 7pm to keep your streak.</p>
        </div>
        <Toggle checked={reminders} onChange={onToggleReminders} label="Daily reminder" />
      </Card>

      <IllustrationPlaceholder
        caption="3D streak / calendar illustration"
        className="h-24"
      />
    </div>
  );
}
