"use client";

import type { Translator } from "@/i18n/types";

export type PlanId = "free" | "premium";
export type Cycle = "monthly" | "yearly";

export interface PlanDisplay {
  id: PlanId;
  name: string;
  tagline: string;

  monthly: number;

  yearly: number;
  popular?: boolean;
}

export const FREE_CARD_LIMIT = 10;

export const MATERIAL_UNLOCK_PRICE = 2.99;

export const PLAN_DISPLAY: Record<PlanId, PlanDisplay> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Dip a toe in",
    monthly: 0,
    yearly: 0,
  },
  premium: {
    id: "premium",
    name: "Premium",
    tagline: "Unlock everything",
    monthly: 4.99,
    yearly: 9.99,
    popular: true,
  },
};

export type SubStatus =
  | { status: "loading" }
  | { status: "signed_out"; materialPurchasedAt?: null }
  | { status: "none"; materialPurchasedAt: number | null }
  | {
      status: "trialing" | "active" | "past_due" | "canceled" | "unpaid" | (string & {});
      trialEnd: number | null;
      currentPeriodEnd: number | null;
      planId: PlanId | null;
      cycle: Cycle | null;
      cancelAtPeriodEnd: boolean;
      materialPurchasedAt: number | null;
    };

export function isActiveStatus(s: SubStatus): boolean {
  return s.status === "trialing" || s.status === "active";
}

export function isPastDueStatus(s: SubStatus): boolean {
  return s.status === "past_due" || s.status === "unpaid";
}

const MATERIAL_FREE_LOCK_MS = 24 * 60 * 60 * 1000;

export type PlanTier = "free" | "premium-monthly" | "premium-yearly" | "material";

export function currentPlanTier(s: SubStatus): PlanTier {
  if ("planId" in s && s.planId === "premium" && isActiveStatus(s)) {
    return s.cycle === "yearly" ? "premium-yearly" : "premium-monthly";
  }
  if ("materialPurchasedAt" in s && s.materialPurchasedAt) return "material";
  return "free";
}

export function isMaterialFreeLockActive(s: SubStatus): boolean {
  if (!("materialPurchasedAt" in s) || !s.materialPurchasedAt) return false;
  return Date.now() - s.materialPurchasedAt < MATERIAL_FREE_LOCK_MS;
}

export type PlanCardTarget = "free" | "premium-monthly" | "premium-yearly" | "material";

export type PlanCardAction = "current" | "disabled" | "upgrade" | "buy";

export function planCardAction(target: PlanCardTarget, s: SubStatus): PlanCardAction {
  const tier = currentPlanTier(s);
  if (tier === target) return "current";

  switch (tier) {
    case "premium-yearly":
      return "disabled";
    case "premium-monthly":
      return target === "premium-yearly" ? "upgrade" : "disabled";
    case "material":
      return target === "free" && isMaterialFreeLockActive(s) ? "disabled" : "buy";
    case "free":
    default:
      return "buy";
  }
}

export function priceFor(planId: PlanId, cycle: Cycle): number {
  const plan = PLAN_DISPLAY[planId];
  return cycle === "yearly" ? plan.yearly : plan.monthly;
}

export function yearlyPerMonth(planId: PlanId): number {
  return PLAN_DISPLAY[planId].yearly / 12;
}

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
}

export function daysLeft(timestampMs: number): number {
  return Math.max(0, Math.ceil((timestampMs - Date.now()) / (1000 * 60 * 60 * 24)));
}

export function planBadgeLabel(s: SubStatus, t: Translator): string {
  if (s.status === "loading") return "…";
  if (!("planId" in s) || !s.planId || !isActiveStatus(s)) return t("planFree");

  const name = (PLAN_DISPLAY[s.planId] ?? PLAN_DISPLAY.premium).name;
  return s.status === "trialing" ? t("planTrial", { name }) : name;
}

export class BillingError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "BillingError";
    this.status = status;
  }

  get isAuthError(): boolean {
    return this.status === 401;
  }
}

/**
 * POST to a billing endpoint and return the Stripe redirect URL. Parses the
 * response defensively — a crashed route returns an HTML error page, not JSON,
 * so `res.json()` is guarded — and always throws a {@link BillingError} on
 * failure so callers get a status code and a human-readable message.
 */
async function requestRedirectUrl(url: string, body?: unknown): Promise<string> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new BillingError("Couldn't reach the server. Check your connection and try again.", 0);
  }

  let data: { url?: string; error?: string } | null = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok || !data?.url) {
    const fallback =
      res.status === 401 ? "Please sign in first." : "Something went wrong. Please try again.";
    throw new BillingError(data?.error || fallback, res.status);
  }
  return data.url;
}

export async function startCheckout(planId: PlanId, cycle: Cycle): Promise<void> {
  const url = await requestRedirectUrl("/api/stripe/checkout", { planId, cycle });
  window.location.href = url;
}

export async function startMaterialCheckout(materialId?: string): Promise<void> {
  const url = await requestRedirectUrl("/api/stripe/checkout", { planId: "material", materialId });
  window.location.href = url;
}

export async function openBillingPortal(): Promise<void> {
  const url = await requestRedirectUrl("/api/stripe/portal");
  window.location.href = url;
}
