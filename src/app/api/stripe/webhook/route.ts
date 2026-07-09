import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

// Needs the raw request body for signature verification — keep this on the
// Node.js runtime, not the Edge runtime.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      // Card was added and the trial subscription was created. Flag this
      // customer so a future checkout doesn't grant a second free trial.
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.customer) {
        await stripe.customers.update(session.customer as string, {
          metadata: { hasUsedTrial: "true" },
        });
      }
      break;
    }

    case "customer.subscription.trial_will_end": {
      // Fires ~3 days before the 30-day trial ends. Good place to email
      // "your trial ends soon, your card will be charged on [date]".
      const sub = event.data.object as Stripe.Subscription;
      console.log("Trial ending soon for subscription:", sub.id);
      break;
    }

    case "invoice.payment_succeeded": {
      // The trial converted: Stripe successfully charged the card on file
      // and the subscription is now "active". This is the moment you
      // detect "payment completed after trial".
      const invoice = event.data.object as Stripe.Invoice;
      // The 2025 "Basil" API moved the subscription off the invoice root onto
      // invoice.parent.subscription_details.
      const subscription = invoice.parent?.subscription_details?.subscription;
      console.log("Payment succeeded, subscription now active:", subscription);
      break;
    }

    case "invoice.payment_failed": {
      // Card on file failed when the trial ended. Stripe will retry
      // automatically per your Dashboard's dunning settings — notify the
      // user so they can update their card.
      const invoice = event.data.object as Stripe.Invoice;
      const subscription = invoice.parent?.subscription_details?.subscription;
      console.log("Payment failed for subscription:", subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.log("Subscription canceled:", sub.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
