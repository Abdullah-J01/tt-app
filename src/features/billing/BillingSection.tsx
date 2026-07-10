"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, CreditCard, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  daysLeft,
  formatPrice,
  isActiveStatus,
  isPastDueStatus,
  openBillingPortal,
  PLAN_DISPLAY,
  priceFor,
  type SubStatus,
} from "./core";

/**
 * Profile billing block. Shows the live subscription (plan, price, renewal) with
 * a "manage payment method" action for members, or a Premium upsell with real
 * pricing for everyone else. Driven entirely by GET /api/stripe/status.
 */
export function BillingSection({
  status,
  onGoPremium,
}: {
  status: SubStatus;
  onGoPremium: () => void;
}) {
  if (status.status === "loading") {
    return <div className="rounded-2xl border-hairline bg-surface mt-4 h-24 animate-pulse border" />;
  }

  if ("planId" in status && (isActiveStatus(status) || isPastDueStatus(status))) {
    return <MembershipCard status={status} />;
  }

  return <UpsellCard onGoPremium={onGoPremium} />;
}

function MembershipCard({ status }: { status: Extract<SubStatus, { planId: unknown }> }) {
  const [portalLoading, setPortalLoading] = useState(false);
  const planId = status.planId ?? "scholar";
  const cycle = status.cycle ?? "monthly";
  const plan = PLAN_DISPLAY[planId];
  const price = priceFor(planId, cycle);
  const pastDue = isPastDueStatus(status);

  async function handleManage() {
    setPortalLoading(true);
    try {
      await openBillingPortal();
    } catch (err) {
      console.error(err);
      setPortalLoading(false);
      alert("Couldn't open billing management. Please try again.");
    }
  }

  return (
    <div className="rounded-2xl border-hairline bg-surface mt-4 overflow-hidden border">
      <div className="from-violet to-violet-dark flex items-center gap-3 bg-gradient-to-r p-4 text-white">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15">
          <Crown className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{plan.name} plan</p>
          <p className="text-sm text-white/80">
            {formatPrice(price)}/mo{cycle === "yearly" ? " · billed yearly" : ""}
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="p-4">
        <p className="text-muted text-sm">{renewalLine(status)}</p>

        {pastDue && (
          <p className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Your last payment failed — update your card to keep Premium.
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            variant={pastDue ? "primary" : "secondary"}
            block
            loading={portalLoading}
            leadingIcon={<CreditCard />}
            onClick={handleManage}
          >
            {pastDue ? "Update payment method" : "Manage payment method"}
          </Button>
          <Link
            href="/premium"
            className="border-hairline text-ink hover:bg-lavender inline-flex h-11 w-full items-center justify-center rounded-xl border text-sm font-semibold transition-colors"
          >
            Change plan
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Extract<SubStatus, { planId: unknown }> }) {
  const label =
    status.status === "trialing"
      ? "Trial"
      : status.status === "active"
        ? status.cancelAtPeriodEnd
          ? "Ending"
          : "Active"
        : "Action needed";
  return (
    <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
      {label}
    </span>
  );
}

function renewalLine(status: Extract<SubStatus, { planId: unknown }>): string {
  if (status.status === "trialing" && status.trialEnd) {
    const left = daysLeft(status.trialEnd);
    const date = new Date(status.trialEnd).toLocaleDateString();
    return left > 0
      ? `Free trial — ${left} day${left === 1 ? "" : "s"} left. Your card is charged on ${date}.`
      : "Your trial ends today — your card will be charged.";
  }
  if (status.currentPeriodEnd) {
    const date = new Date(status.currentPeriodEnd).toLocaleDateString();
    return status.cancelAtPeriodEnd
      ? `Premium ends on ${date}. You can resume anytime before then.`
      : `Renews on ${date}.`;
  }
  return "Manage your subscription and payment method below.";
}

function UpsellCard({ onGoPremium }: { onGoPremium: () => void }) {
  const scholar = PLAN_DISPLAY.scholar;
  const genius = PLAN_DISPLAY.genius;

  return (
    <div className="mt-4">
      <Button
        unstyled
        type="button"
        onClick={onGoPremium}
        className="hover-lift from-violet to-violet-dark flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r p-4 text-left text-white"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15">
          <Crown className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block font-bold">Go Premium</span>
          <span className="block text-sm text-white/80">Unlock every studybook &amp; offline.</span>
        </span>
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Pricing preview → full comparison on /premium */}
      <Link
        href="/premium"
        className="border-hairline bg-surface hover:bg-lavender/40 mt-2 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors"
      >
        <span className="text-ink flex-1">
          <span className="font-semibold">{scholar.name}</span> {formatPrice(scholar.monthly)}/mo
          <span className="text-muted"> · </span>
          <span className="font-semibold">{genius.name}</span> {formatPrice(genius.monthly)}/mo
        </span>
        <span className="text-violet font-semibold">See all plans</span>
        <ChevronRight className="text-muted h-4 w-4" />
      </Link>
    </div>
  );
}
