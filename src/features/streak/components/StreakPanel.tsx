"use client";

import { Fragment, useEffect, useState } from "react";
import { useTranslations } from "@/i18n/client";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Flame, Star, Trophy } from "lucide-react";
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
  const t = useTranslations("features_streak_components_StreakPanel");

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

  return (
    <Portal>
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={t("panelLabel")}>
      <div className="fade-in absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="drawer-up md-drawer-right bg-surface absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-full md:max-w-md md:rounded-none md:rounded-l-2xl">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeLabel")}
            className="text-faint hover:text-ink hover:bg-lavender grid h-9 w-9 place-items-center rounded-full transition-colors active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-display text-ink text-lg font-bold">{t("title")}</h2>
          <span
            aria-hidden
            className="text-faint grid h-9 w-9 place-items-center rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </span>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain p-5">
          {streak === 0 && (
            <div className="border-hairline mb-6 flex flex-col items-center rounded-2xl border p-6 text-center">
              <StreakFlame size={64} lit={false} />
              <h3 className="text-ink mt-4 text-lg font-bold">{t("startTitle")}</h3>
              <p className="text-muted mt-1 text-sm">
                {t("startBody")}
              </p>
              <Link
                href="/feed"
                onClick={onClose}
                className="bg-violet hover:bg-violet-dark mt-4 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
              >
                {t("continueReading")}
              </Link>
            </div>
          )}

          <div className="mb-6">
            <div className="text-muted mb-3 flex items-center justify-between text-xs font-medium">
              <span>{t("milestones")}</span>
              {nextMilestone && (
                <span>
                  {t("daysToMilestone", { days: daysToNext, milestone: nextMilestone })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {/* leading day dots up to the first milestone */}
              {Array.from({ length: STREAK_MILESTONES[0] ?? 7 }).map((_, i) => (
                <span
                  key={`dot-${i}`}
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    i < streak ? "bg-amber" : "bg-mist"
                  }`}
                />
              ))}
              {/* milestone chips joined by tracks */}
              {STREAK_MILESTONES.map((m, idx) => {
                const reached = streak >= m;
                const prevReached = idx === 0 || streak >= (STREAK_MILESTONES[idx - 1] ?? 0);
                return (
                  <Fragment key={m}>
                    {idx > 0 && (
                      <span
                        className={`h-1 flex-1 rounded-full ${prevReached ? "bg-amber" : "bg-mist"}`}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setInfo("milestones")}
                      aria-label={t("milestoneDetails", { days: m })}
                      className={`grid h-8 min-w-8 shrink-0 place-items-center rounded-lg border px-1.5 text-sm font-semibold transition-transform active:scale-90 ${
                        reached
                          ? "border-amber bg-amber text-white"
                          : "border-hairline bg-surface text-muted hover:border-amber"
                      }`}
                    >
                      {m}
                    </button>
                  </Fragment>
                );
              })}
            </div>
          </div>

          <div className="border-hairline mb-6 grid grid-cols-3 rounded-2xl border py-4">
            <Counter
              icon={<Trophy size={18} className="text-amber-dark" />}
              value={maxStreak}
              label={t("maxStreakLabel")}
              onClick={() => setInfo("milestones")}
            />
            <Counter
              icon={<Flame size={18} className="text-amber" fill="currentColor" />}
              value={streak}
              label={t("streakLabel")}
              divider
              onClick={() => setInfo("milestones")}
            />
            <Counter
              icon={<Star size={18} className="text-violet" fill="currentColor" />}
              value={freezes}
              label={t("freezesLabel")}
              onClick={() => setInfo("freezes")}
            />
          </div>

          <StreakCalendar activeDays={activeDays} />
        </div>
      </div>

      <StreakInfoSheet open={info === "milestones"} onClose={() => setInfo(null)} title={t("milestonesSheetTitle")}>
        <StreakMilestones />
      </StreakInfoSheet>
      <StreakInfoSheet open={info === "freezes"} onClose={() => setInfo(null)} title={t("freezesSheetTitle")}>
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
