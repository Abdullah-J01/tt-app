import Stripe from "stripe";

/**
 * Stripe client — MVP stub for premium/subscriptions.
 *
 * Constructed lazily (not at module load) so a missing `STRIPE_SECRET_KEY`
 * doesn't throw during `next build` page-data collection. Call this only from
 * server code, after you've confirmed the key is present.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return (client ??= new Stripe(key));
}
