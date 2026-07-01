import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/**
 * POST /api/stripe/checkout — create a Checkout Session for Premium.
 * MVP stub: guarded so it fails gracefully until Stripe is configured.
 *
 * TODO(team):
 *  - Look up / create the Stripe customer for the signed-in user.
 *  - Use a real Price ID and success/cancel URLs.
 *  - Handle the webhook in /api/stripe/webhook to update Subscription.
 */
export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 501 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID ?? "price_placeholder", quantity: 1 }],
    success_url: `${appUrl}/profile?upgraded=1`,
    cancel_url: `${appUrl}/profile`,
  });

  return NextResponse.json({ url: session.url });
}
