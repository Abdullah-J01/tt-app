import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  const customers = await stripe.customers.list({ email: session.user.email, limit: 1 });
  const customer = customers.data[0];
  if (!customer) {
    return NextResponse.json({ error: "No billing account yet" }, { status: 404 });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${origin}/premium`,
  });

  return NextResponse.json({ url: portalSession.url });
}
