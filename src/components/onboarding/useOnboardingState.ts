"use client";

import { useEffect, useState } from "react";

/** Persisted onboarding progress. Non-sensitive selections only — never credentials. */
export interface OnboardingData {
  /** Current step index. */
  step: number;
  /** Furthest step reached — gates the forward affordance. */
  maxStep: number;
  grade: string | null;
  /** Stored as an array (Set isn't JSON-serialisable); the flow works with a Set. */
  interests: string[];
  dailyGoal: number;
  reminders: boolean;
}

const STORAGE_KEY = "sb:onboarding:v1";

const DEFAULTS: OnboardingData = {
  step: 0,
  maxStep: 0,
  grade: null,
  interests: [],
  dailyGoal: 5,
  reminders: true,
};

/**
 * Onboarding state backed by localStorage so selections + progress survive reloads.
 * SSR-safe: renders defaults on the server/first paint, then hydrates from storage
 * (callers should gate their UI on `hydrated` to avoid a wrong-step flash).
 */
export function useOnboardingState() {
  const [data, setData] = useState<OnboardingData>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount (localStorage is client-only).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setData((d) => ({ ...d, ...(JSON.parse(raw) as Partial<OnboardingData>) }));
    } catch {
      /* corrupt or unavailable storage → keep defaults */
    }
    setHydrated(true);
  }, []);

  // Persist after every change (but not before hydration, or we'd clobber saved data).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full/blocked → non-fatal */
    }
  }, [data, hydrated]);

  const update = (patch: Partial<OnboardingData>) => setData((d) => ({ ...d, ...patch }));

  const clear = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setData(DEFAULTS);
  };

  return { data, update, hydrated, clear };
}
