// Maps your app's plan/cycle combo to the Stripe Price IDs you create in
// the Stripe Dashboard. Create one Product for Premium with two recurring
// Prices (monthly $4.99, yearly $9.99 — the yearly one is the *total* for the
// year, not a per-month rate) — do NOT set a trial on the Price itself; the
// trial is applied per-checkout in the API route so you can later choose to
// skip it for returning customers.
//
// The per-material unlock is a separate Product with a single one-time Price
// ($2.99), bought through Checkout in `payment` mode rather than `subscription`.
export const PRICE_IDS = {
  premium: {
    monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY!,
  },
} as const;

/** One-time Price for unlocking a single material. */
export const MATERIAL_PRICE_ID = process.env.STRIPE_PRICE_MATERIAL_ONETIME!;

/** How many cards a signed-out / free user gets before the paywall. */
export const FREE_CARD_LIMIT = 10;

export type PaidPlanId = keyof typeof PRICE_IDS;
export type Cycle = "monthly" | "yearly";

/** A recurring plan that goes through Checkout in `subscription` mode. */
export function isPaidPlan(id: string): id is PaidPlanId {
  return id === "premium";
}

/** The one-time per-material unlock (Checkout in `payment` mode). */
export function isMaterialPlan(id: string): id is "material" {
  return id === "material";
}
