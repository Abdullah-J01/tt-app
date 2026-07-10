import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ status: "signed_out" });
  }

  const customers = await stripe.customers.list({ email: session.user.email, limit: 1 });
  const customer = customers.data[0];
  if (!customer) {
    return NextResponse.json({ status: "none" });
  }

  const subs = await stripe.subscriptions.list({
    customer: customer.id,
    status: "all",
    limit: 1,
    expand: ["data.items.data.price"],
  });
  const sub = subs.data[0];
  if (!sub) {
    return NextResponse.json({ status: "none" });
  }

  // As of the 2025 "Basil" API, current_period_end lives on each subscription
  // item, not the subscription. These plans have a single item, so read the
  // first item's period end.
  const currentPeriodEnd = sub.items.data[0]?.current_period_end ?? null;

  return NextResponse.json({
    status: sub.status, // "trialing" | "active" | "past_due" | "canceled" | "unpaid" ...
    trialEnd: sub.trial_end ? sub.trial_end * 1000 : null,
    currentPeriodEnd: currentPeriodEnd ? currentPeriodEnd * 1000 : null,
    planId: sub.metadata?.planId ?? null,
    cycle: sub.metadata?.cycle ?? null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  });
}
