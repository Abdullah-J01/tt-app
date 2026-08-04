"use server";

export interface OnboardingPrefs {
  /** Selected grade slug, or null if the user skipped grade selection. */
  grade: string | null;
  /** Selected subject slugs. */
  interests: string[];
  /** Cards-per-day goal. */
  dailyGoal: number;
  /** Daily reminder opt-in. */
  reminders: boolean;
}

/**
 * Single persistence seam for onboarding. The client flow calls this and never
 * holds the network call itself. Deliberately doesn't navigate — the plan step
 * decides where to go next (Home for Free, Stripe Checkout for Premium).
 *
 * TODO(team): persist `prefs` to TaskuTark (e.g. POST /v1/me/onboarding) once the
 * endpoint exists — see docs/TT_API_ENDPOINTS.md §B/§C.
 */
export async function finishOnboarding(prefs: OnboardingPrefs): Promise<void> {
  void prefs;
}
