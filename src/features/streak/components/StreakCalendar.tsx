"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toKey } from "../useStreak";

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

interface StreakCalendarProps {
  activeDays: Set<string>;
  compact?: boolean;
}

export function StreakCalendar({ activeDays, compact = false }: StreakCalendarProps) {
  const t = useTranslations("features_streak_components_StreakCalendar");
  const today = new Date();
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toKey(today);

  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const step = (delta: number) => setView(new Date(year, month + delta, 1));

  return (
    <div>
      <div className={cn("flex items-center justify-between", compact ? "mb-2" : "mb-3")}>
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={t("previousMonth")}
          className={cn(
            "text-faint hover:text-ink hover:bg-lavender grid place-items-center rounded-full transition-colors",
            compact ? "h-7 w-7" : "h-8 w-8",
          )}
        >
          <ChevronLeft className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </button>
        <h3 className={cn("text-ink font-display font-bold", compact ? "text-sm" : "text-base")}>
          {t(MONTHS[month]!)} {year}
        </h3>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label={t("nextMonth")}
          className={cn(
            "text-faint hover:text-ink hover:bg-lavender grid place-items-center rounded-full transition-colors",
            compact ? "h-7 w-7" : "h-8 w-8",
          )}
        >
          <ChevronRight className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </button>
      </div>

      <div
        className={cn(
          "text-muted grid grid-cols-7 gap-1 text-center font-medium",
          compact ? "text-[11px]" : "text-xs",
        )}
      >
        {WEEKDAYS.map((d) => (
          <span key={d} className={compact ? "py-0.5" : "py-1"}>
            {t(d)}
          </span>
        ))}
      </div>

      <div className={cn("mt-1 grid grid-cols-7", compact ? "gap-x-1 gap-y-0.5" : "gap-1")}>
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} />;
          const key = toKey(new Date(year, month, day));
          const active = activeDays.has(key);
          const isToday = key === todayKey;
          return (
            <span
              key={key}
              aria-current={isToday ? "date" : undefined}
              className={cn(
                "grid place-items-center rounded-full transition-colors",
                // Compact keeps the circle by fixing the cell size instead of
                // squaring the full column width.
                compact ? "mx-auto h-7 w-7 text-xs" : "aspect-square text-sm",
                active
                  ? "bg-amber font-semibold text-white"
                  : isToday
                    ? "text-amber-dark ring-amber ring-2 ring-inset font-semibold"
                    : "text-ink/70",
              )}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}
