"use client";

import { useEffect, useState } from "react";
import { claimAnonymousBucket, useUserStorage } from "@/lib/storage";
import type { Cycle, PlanId } from "@/features/billing";

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
  /** Plan step selection — pre-selects Premium so the CTA reads as an upgrade by default. */
  plan: PlanId;
  cycle: Cycle;
}

const DEFAULTS: OnboardingData = {
  step: 0,
  maxStep: 0,
  grade: null,
  interests: [],
  dailyGoal: 5,
  reminders: true,
  plan: "premium",
  cycle: "yearly",
};

/**
 * Onboarding state backed by localStorage so selections + progress survive reloads.
 * SSR-safe: renders defaults on the server/first paint, then hydrates from storage
 * (callers should gate their UI on `hydrated` to avoid a wrong-step flash).
 *
 * Stored in a per-account bucket (`@/lib/storage`) like every other piece of
 * user state, so two people onboarding on one browser don't inherit each
 * other's grade and interests. This is the one flow that legitimately starts
 * signed-out — the marketing hero links straight into it — so a draft left in
 * the anonymous bucket is claimed by the account that signs in next, and only
 * if that account has no draft of its own.
 */
export function useOnboardingState() {
  const { key, email, ready } = useUserStorage("onboarding");
  const [data, setData] = useState<OnboardingData>(DEFAULTS);
  /** Bucket `data` was loaded from — null until the first hydration. */
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const hydrated = loadedKey !== null;

  // Load once the session names the bucket (localStorage is client-only).
  useEffect(() => {
    if (!ready) return;
    claimAnonymousBucket("onboarding", email);
    try {
      const raw = window.localStorage.getItem(key);
      setData(raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<OnboardingData>) } : DEFAULTS);
    } catch {
      /* corrupt or unavailable storage → keep defaults */
    }
    setLoadedKey(key);
  }, [key, email, ready]);

  /**
   * Persist after every change — but never before this bucket has been loaded.
   * The `loadedKey === key` check is what makes a *sign-out* safe: `key` flips
   * to the anonymous bucket one render before the reload effect replaces
   * `data`, and writing in that gap would copy the signed-in user's draft into
   * the anonymous bucket for the next person on this browser.
   */
  useEffect(() => {
    if (loadedKey !== key) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch {
      /* storage full/blocked → non-fatal */
    }
  }, [data, loadedKey, key]);

  const update = (patch: Partial<OnboardingData>) => setData((d) => ({ ...d, ...patch }));

  const clear = () => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setData(DEFAULTS);
  };

  return { data, update, hydrated, clear };
}
