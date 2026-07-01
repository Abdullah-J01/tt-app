import Stripe from "stripe";

/**
 * Stripe client — MVP stub for premium/subscriptions.
 * The secret key is read from the environment; keep it server-only.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
