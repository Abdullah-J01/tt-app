// Maps your app's plan/cycle combo to the Stripe Price IDs you create in
// the Stripe Dashboard. Create one Product per plan (Scholar, Genius) and
// two recurring Prices on each (monthly, yearly) — do NOT set a trial on
// the Price itself; the trial is applied per-checkout in the API route so
// you can later choose to skip it for returning customers.
export const PRICE_IDS = {
  scholar: {
    monthly: process.env.STRIPE_PRICE_SCHOLAR_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_SCHOLAR_YEARLY!,
  },
  genius: {
    monthly: process.env.STRIPE_PRICE_GENIUS_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_GENIUS_YEARLY!,
  },
} as const;

export type PaidPlanId = keyof typeof PRICE_IDS;
export type Cycle = "monthly" | "yearly";

export function isPaidPlan(id: string): id is PaidPlanId {
  return id === "scholar" || id === "genius";
}
