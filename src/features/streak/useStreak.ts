"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUserStorage } from "@/lib/storage";

export interface Milestone {
  days: number;
  freezes: number;
  badge?: string;
  reachPct?: number;
}

export interface StreakState {
  activeDays: string[];
  freezes: number;
}

export const STREAK_MILESTONE_DETAILS: Milestone[] = [
  { days: 7, freezes: 1 },
  { days: 14, freezes: 2, badge: "Flame", reachPct: 44 },
  { days: 30, freezes: 3, badge: "Wildfire", reachPct: 12 },
];

export const STREAK_MILESTONES = STREAK_MILESTONE_DETAILS.map((m) => m.days);

export const MAX_FREEZES = 5;

const EVENT = "tt:streak";
const EMPTY: StreakState = { activeDays: [], freezes: 0 };
const DEFAULT_FREEZES = 4;

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}


function read(key: string): StreakState {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StreakState>;
      return {
        activeDays: Array.isArray(parsed.activeDays) ? parsed.activeDays : [],
        freezes: typeof parsed.freezes === "number" ? parsed.freezes : DEFAULT_FREEZES,
      };
    }
  } catch {
    /* ignore */
  }
  return { activeDays: [], freezes: DEFAULT_FREEZES };
}

function write(key: string, state: StreakState): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* ignore quota / disabled storage */
  }
  window.dispatchEvent(new Event(EVENT));
}

function currentStreak(active: Set<string>): number {
  const today = new Date();
  let cursor = active.has(toKey(today))
    ? today
    : active.has(toKey(addDays(today, -1)))
      ? addDays(today, -1)
      : null;
  if (!cursor) return 0;

  let count = 0;
  while (active.has(toKey(cursor))) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

function maxStreak(active: Set<string>): number {
  let best = 0;
  for (const day of active) {
    if (active.has(toKey(addDays(new Date(day), -1)))) continue;
    let cursor = new Date(day);
    let run = 0;
    while (active.has(toKey(cursor))) {
      run += 1;
      cursor = addDays(cursor, 1);
    }
    best = Math.max(best, run);
  }
  return best;
}

export function useStreak() {
  const { key, ready } = useUserStorage("streak");
  const [state, setState] = useState<StreakState>(EMPTY);
  // Storage is client-only, so `streak` is 0 until the first effect runs.
  // Callers that show the number gate on this rather than painting a 0 they
  // will immediately have to correct.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Same gate as useLibrary / useReadingProgress: `key` isn't final until the
    // session resolves, and hydrating the anonymous bucket first would announce
    // a 0-day streak as loaded and then correct it.
    if (!ready) return;

    setState(read(key));
    setHydrated(true);
    const sync = () => setState(read(key));
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, [key, ready]);

  const activeDays = useMemo(() => new Set(state.activeDays), [state.activeDays]);
  const streak = useMemo(() => currentStreak(activeDays), [activeDays]);
  const max = useMemo(() => maxStreak(activeDays), [activeDays]);

  const markToday = useCallback(() => {
    if (!ready) return;
    const today = toKey(new Date());
    const prev = read(key);
    if (prev.activeDays.includes(today)) return;
    const next = { ...prev, activeDays: [...prev.activeDays, today] };
    write(key, next);
    setState(next);
  }, [key, ready]);

  const nextMilestone = STREAK_MILESTONES.find((m) => m > streak) ?? null;
  const daysToNext = nextMilestone ? nextMilestone - streak : 0;

  return {
    streak,
    hydrated,
    maxStreak: max,
    freezes: state.freezes,
    activeDays,
    nextMilestone,
    daysToNext,
    markToday,
  };
}
