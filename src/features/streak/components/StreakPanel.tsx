"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Star, Trophy, X } from "lucide-react";
import { STREAK_MILESTONES, useStreak } from "../useStreak";
import { StreakCalendar } from "./StreakCalendar";
import { StreakFlame } from "./StreakFlame";
import { StreakInfoSheet } from "./StreakInfoSheet";
import { StreakMilestones } from "./StreakMilestones";
import { StreakFreezesInfo } from "./StreakFreezesInfo";
import { useScrollLock } from "@/lib/useScrollLock";
import { Portal } from "@/lib/Portal";

interface StreakPanelProps {
  open: boolean;
  onClose: () => void;
}

export function StreakPanel({ open, onClose }: StreakPanelProps) {
  const { streak, maxStreak, freezes, activeDays, nextMilestone, daysToNext } = useStreak();
  const [info, setInfo] = useState<null | "milestones" | "freezes">(null);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const maxMilestone = STREAK_MILESTONES[STREAK_MILESTONES.length - 1] ?? 30;
  const progress = Math.min(streak / maxMilestone, 1);

  return (
    <Portal>
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Reading streak">
      <div className="fade-in absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="drawer-up md-drawer-right bg-surface absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-full md:max-w-md md:rounded-none md:rounded-l-2xl">
        <div className="border-hairline flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-display text-ink flex items-center gap-2 text-lg font-bold">
            <Flame size={20} className={streak > 0 ? "text-amber" : "text-faint"} fill={streak > 0 ? "currentColor" : "none"} />
            Reading streak
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close streak"
            className="hover:bg-lavender grid h-9 w-9 place-items-center rounded-full active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain p-5">
          {streak === 0 && (
            <div className="border-hairline mb-6 flex flex-col items-center rounded-2xl border p-6 text-center">
              <StreakFlame size={64} lit={false} />
              <h3 className="text-ink mt-4 text-lg font-bold">Start your streak</h3>
              <p className="text-muted mt-1 text-sm">
                Read a studybook today to light your flame and begin a streak.
              </p>
              <Link
                href="/feed"
                onClick={onClose}
                className="bg-violet hover:bg-violet-dark mt-4 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
              >
                Continue reading
              </Link>
            </div>
          )}

          <div className="mb-6">
            <div className="text-muted mb-3 flex items-center justify-between text-xs font-medium">
              <span>Milestones</span>
              {nextMilestone && (
                <span>
                  {daysToNext} {daysToNext === 1 ? "day" : "days"} to {nextMilestone}-day streak
                </span>
              )}
            </div>
            <div className="relative">
              <div className="bg-mist h-1.5 rounded-full" />
              <div
                className="bg-amber absolute top-0 left-0 h-1.5 rounded-full transition-[width]"
                style={{ width: `${progress * 100}%` }}
              />
              <div className="absolute inset-x-0 -top-2.5 flex justify-between">
                {STREAK_MILESTONES.map((m) => {
                  const reached = streak >= m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setInfo("milestones")}
                      aria-label={`${m}-day milestone details`}
                      className={`grid h-7 w-7 place-items-center rounded-lg border text-xs font-semibold transition-transform active:scale-90 ${
                        reached
                          ? "border-amber bg-amber text-white"
                          : "border-hairline bg-surface text-muted hover:border-amber"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-hairline mb-6 grid grid-cols-3 rounded-2xl border py-4">
            <Counter
              icon={<Trophy size={18} className="text-amber-dark" />}
              value={maxStreak}
              label="max streak"
              onClick={() => setInfo("milestones")}
            />
            <Counter
              icon={<Flame size={18} className="text-amber" fill="currentColor" />}
              value={streak}
              label="streak"
              divider
              onClick={() => setInfo("milestones")}
            />
            <Counter
              icon={<Star size={18} className="text-violet" fill="currentColor" />}
              value={freezes}
              label="freezes"
              onClick={() => setInfo("freezes")}
            />
          </div>

          <StreakCalendar activeDays={activeDays} />
        </div>
      </div>

      <StreakInfoSheet open={info === "milestones"} onClose={() => setInfo(null)} title="Streak Milestones">
        <StreakMilestones />
      </StreakInfoSheet>
      <StreakInfoSheet open={info === "freezes"} onClose={() => setInfo(null)} title="Streak Freezes">
        <StreakFreezesInfo />
      </StreakInfoSheet>
    </div>
    </Portal>
  );
}

function Counter({
  icon,
  value,
  label,
  divider,
  onClick,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  divider?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${value} ${label}`}
      className={`flex flex-col items-center gap-1 px-2 transition-transform active:scale-95 ${
        divider ? "border-hairline border-x" : ""
      }`}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-ink text-xl font-bold">{value}</span>
      </div>
      <span className="text-muted text-xs">{label}</span>
    </button>
  );
}
