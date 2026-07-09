// import Stripe from "stripe";

// /**
//  * Stripe client — MVP stub for premium/subscriptions.
//  *
//  * Constructed lazily (not at module load) so a missing `STRIPE_SECRET_KEY`
//  * doesn't throw during `next build` page-data collection. Call this only from
//  * server code, after you've confirmed the key is present.
//  */
// let client: Stripe | null = null;

// export function getStripe(): Stripe {
//   const key = process.env.STRIPE_SECRET_KEY;
//   if (!key) {
//     throw new Error("STRIPE_SECRET_KEY is not set");
//   }
//   return (client ??= new Stripe(key));
// }

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

// Single shared Stripe client, server-side only. Never import this file
// from a "use client" component — it will crash on missing env vars in
// the browser bundle and would leak your secret key if it somehow ran there.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-06-24.dahlia",
});
