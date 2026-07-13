"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, CreditCard, Crown } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import type { Translator } from "@/i18n/types";
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
  const t = useTranslations("features_billing_BillingSection");
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
      alert(t("portalError"));
    }
  }

  return (
    <div className="rounded-2xl border-hairline bg-surface mt-4 overflow-hidden border">
      <div className="from-violet to-violet-dark flex items-center gap-3 bg-gradient-to-r p-4 text-white">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15">
          <Crown className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{t("planName", { name: plan.name })}</p>
          <p className="text-sm text-white/80">
            {t("perMonth", { price: formatPrice(price) })}
            {cycle === "yearly" ? t("billedYearly") : ""}
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="p-4">
        <p className="text-muted text-sm">{renewalLine(status, t)}</p>

        {pastDue && (
          <p className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {t("paymentFailed")}
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
            {pastDue ? t("updatePayment") : t("managePayment")}
          </Button>
          <Link
            href="/premium"
            className="border-hairline text-ink hover:bg-lavender inline-flex h-11 w-full items-center justify-center rounded-xl border text-sm font-semibold transition-colors"
          >
            {t("changePlan")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Extract<SubStatus, { planId: unknown }> }) {
  const t = useTranslations("features_billing_BillingSection");
  const label =
    status.status === "trialing"
      ? t("trial")
      : status.status === "active"
        ? status.cancelAtPeriodEnd
          ? t("ending")
          : t("active")
        : t("actionNeeded");
  return (
    <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
      {label}
    </span>
  );
}

/** Localized renewal/trial sentence. `t` is threaded in so it stays a pure helper. */
function renewalLine(status: Extract<SubStatus, { planId: unknown }>, t: Translator): string {
  if (status.status === "trialing" && status.trialEnd) {
    const left = daysLeft(status.trialEnd);
    return left > 0
      ? t("trialLine", { days: left, date: new Date(status.trialEnd) })
      : t("trialEndsToday");
  }
  if (status.currentPeriodEnd) {
    const date = new Date(status.currentPeriodEnd);
    return status.cancelAtPeriodEnd ? t("premiumEnds", { date }) : t("renewsOn", { date });
  }
  return t("manageBelow");
}

function UpsellCard({ onGoPremium }: { onGoPremium: () => void }) {
  const t = useTranslations("features_billing_BillingSection");
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
          <span className="block font-bold">{t("goPremium")}</span>
          <span className="block text-sm text-white/80">{t("goPremiumSub")}</span>
        </span>
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Pricing preview → full comparison on /premium */}
      <Link
        href="/premium"
        className="border-hairline bg-surface hover:bg-lavender/40 mt-2 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors"
      >
        <span className="text-ink flex-1">
          <span className="font-semibold">{scholar.name}</span>{" "}
          {t("perMonth", { price: formatPrice(scholar.monthly) })}
          <span className="text-muted"> · </span>
          <span className="font-semibold">{genius.name}</span>{" "}
          {t("perMonth", { price: formatPrice(genius.monthly) })}
        </span>
        <span className="text-violet font-semibold">{t("seeAllPlans")}</span>
        <ChevronRight className="text-muted h-4 w-4" />
      </Link>
    </div>
  );
}
