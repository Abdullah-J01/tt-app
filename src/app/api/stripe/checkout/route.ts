// import { NextResponse } from "next/server";
// import { getStripe } from "@/lib/stripe";

// /**
//  * POST /api/stripe/checkout — create a Checkout Session for Premium.
//  * MVP stub: guarded so it fails gracefully until Stripe is configured.
//  *
//  * TODO(team):
//  *  - Look up / create the Stripe customer for the signed-in user.
//  *  - Use a real Price ID and success/cancel URLs.
//  *  - Handle the webhook in /api/stripe/webhook to update Subscription.
//  */
// export async function POST() {
//   if (!process.env.STRIPE_SECRET_KEY) {
//     return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 501 });
//   }

//   const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

//   const session = await getStripe().checkout.sessions.create({
//     mode: "subscription",
//     line_items: [{ price: process.env.STRIPE_PRICE_ID ?? "price_placeholder", quantity: 1 }],
//     success_url: `${appUrl}/profile?upgraded=1`,
//     cancel_url: `${appUrl}/profile`,
//   });

//   return NextResponse.json({ url: session.url });
// }
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// Adjust this import to wherever you export your NextAuth config, e.g.
// "@/app/api/auth/[...nextauth]/route" or "@/lib/auth".
import { authOptions } from "@/lib/auth";
import { stripe, stripeErrorMessage } from "@/lib/stripe";
import { PRICE_IDS, isPaidPlan, type Cycle } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const body = (await req.json()) as { planId?: string; cycle?: Cycle };
  const { planId, cycle } = body;

  if (!planId || !isPaidPlan(planId) || (cycle !== "monthly" && cycle !== "yearly")) {
    return NextResponse.json({ error: "Invalid plan or billing cycle" }, { status: 400 });
  }

  const priceId = PRICE_IDS[planId][cycle];
  if (!priceId) {
    return NextResponse.json(
      { error: "This plan isn't available right now. Please try again later." },
      { status: 500 },
    );
  }

  try {
    // Reuse a Stripe customer if this email already has one. Since there's
    // no database, Stripe itself is the source of truth — customers are
    // looked up by email on every request.
    const existing = await stripe.customers.list({ email: session.user.email, limit: 1 });
    const customer =
      existing.data[0] ??
      (await stripe.customers.create({
        email: session.user.email,
        name: session.user.name ?? undefined,
      }));

    // Prevent a second free trial: once hasUsedTrial is set (by the webhook
    // below), later checkouts for this customer skip trial_period_days.
    const hadTrialBefore = customer.metadata?.hasUsedTrial === "true";

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      // Collects the card even though the subscription starts as a trial —
      // this is what makes "add card first, trial starts, auto-charge after
      // 30 days" work.
      payment_method_collection: "always",
      subscription_data: {
        trial_period_days: hadTrialBefore ? undefined : 30,
        metadata: { planId, cycle },
      },
      success_url: `${origin}/premium?checkout=success`,
      cancel_url: `${origin}/premium?checkout=cancelled`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 502 });
  }
}
