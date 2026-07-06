"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toKey } from "../useStreak";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface StreakCalendarProps {
  activeDays: Set<string>;
}

export function StreakCalendar({ activeDays }: StreakCalendarProps) {
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
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous month"
          className="text-faint hover:text-ink hover:bg-lavender grid h-8 w-8 place-items-center rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-ink font-display text-base font-bold">
          {MONTHS[month]} {year}
        </h3>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next month"
          className="text-faint hover:text-ink hover:bg-lavender grid h-8 w-8 place-items-center rounded-full transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="text-muted grid grid-cols-7 gap-1 text-center text-xs font-medium">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} />;
          const key = toKey(new Date(year, month, day));
          const active = activeDays.has(key);
          const isToday = key === todayKey;
          return (
            <span
              key={key}
              aria-current={isToday ? "date" : undefined}
              className={`grid aspect-square place-items-center rounded-full text-sm transition-colors ${
                active
                  ? "bg-amber font-semibold text-white"
                  : isToday
                    ? "text-amber-dark ring-amber ring-2 ring-inset font-semibold"
                    : "text-ink/70"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}
