"use client";

// Client-side billing helpers shared by the Profile and Premium surfaces.
// The authoritative prices/currency live in Stripe (the Price IDs in
// src/lib/plans.ts); the numbers here are display-only and must be kept in
// sync with the Prices you create in the Dashboard.

import type { Translator } from "@/i18n/types";

export type PlanId = "free" | "premium";
export type Cycle = "monthly" | "yearly";

export interface PlanDisplay {
  id: PlanId;
  name: string;
  tagline: string;
  /** USD per month, billed monthly. */
  monthly: number;
  /** USD total, billed once per year (NOT a per-month rate). */
  yearly: number;
  popular?: boolean;
}

/** How many cards a free/signed-out user gets before the paywall. */
export const FREE_CARD_LIMIT = 10;

/** One-time price (USD) to unlock a single study material. Not a subscription. */
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

// Mirrors the JSON shape returned by GET /api/stripe/status.
export type SubStatus =
  | { status: "loading" }
  | { status: "signed_out" | "none" }
  | {
      status: "trialing" | "active" | "past_due" | "canceled" | "unpaid" | (string & {});
      trialEnd: number | null;
      currentPeriodEnd: number | null;
      planId: PlanId | null;
      cycle: Cycle | null;
      cancelAtPeriodEnd: boolean;
    };

/** A subscription that grants Premium right now (trial counts). */
export function isActiveStatus(s: SubStatus): boolean {
  return s.status === "trialing" || s.status === "active";
}

/** A subscription that needs the user's attention (failed payment). */
export function isPastDueStatus(s: SubStatus): boolean {
  return s.status === "past_due" || s.status === "unpaid";
}

/** The sticker price for a plan/cycle combo — a per-month rate when
 * `monthly`, the total charged once a year when `yearly`. */
export function priceFor(planId: PlanId, cycle: Cycle): number {
  const plan = PLAN_DISPLAY[planId];
  return cycle === "yearly" ? plan.yearly : plan.monthly;
}

/** The yearly plan's total, expressed as an effective per-month rate, for
 * "$0.83/mo, billed yearly"-style copy. */
export function yearlyPerMonth(planId: PlanId): number {
  return PLAN_DISPLAY[planId].yearly / 12;
}

/** "$6" for whole dollars, "$4.99" / "$9.99" otherwise. */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
}

export function daysLeft(timestampMs: number): number {
  return Math.max(0, Math.ceil((timestampMs - Date.now()) / (1000 * 60 * 60 * 24)));
}

/**
 * Short plan label for the profile badge, e.g. "Premium · Trial". `t` is a
 * translator bound to `features_profile_components_ProfileView` (keys `planFree`
 * and `planTrial`); plan names stay as brand terms.
 */
export function planBadgeLabel(s: SubStatus, t: Translator): string {
  if (s.status === "loading") return "…";
  if (!("planId" in s) || !s.planId || !isActiveStatus(s)) return t("planFree");
  const name = PLAN_DISPLAY[s.planId].name;
  return s.status === "trialing" ? t("planTrial", { name }) : name;
}

/**
 * A billing request that failed. Carries the HTTP status so the UI can tell
 * "you're not signed in" (401) apart from a real Stripe/server error and show
 * the right message + call to action.
 */
export class BillingError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "BillingError";
    this.status = status;
  }
  /** The user needs to sign in before they can be charged. */
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
    // Network failure, offline, DNS, etc. — never reached the server.
    throw new BillingError("Couldn't reach the server. Check your connection and try again.", 0);
  }

  let data: { url?: string; error?: string } | null = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON body (e.g. an unhandled 500 HTML page).
  }

  if (!res.ok || !data?.url) {
    const fallback =
      res.status === 401
        ? "Please sign in first."
        : "Something went wrong. Please try again.";
    throw new BillingError(data?.error || fallback, res.status);
  }
  return data.url;
}

/** POST /api/stripe/checkout, then redirect to Stripe Checkout. */
export async function startCheckout(planId: PlanId, cycle: Cycle): Promise<void> {
  const url = await requestRedirectUrl("/api/stripe/checkout", { planId, cycle });
  window.location.href = url;
}

/** POST /api/stripe/checkout for the one-time per-material unlock ($2.99),
 * then redirect to Stripe Checkout. `materialId` is passed through as
 * Checkout session metadata for whichever material is being unlocked. */
export async function startMaterialCheckout(materialId?: string): Promise<void> {
  const url = await requestRedirectUrl("/api/stripe/checkout", { planId: "material", materialId });
  window.location.href = url;
}

/** POST /api/stripe/portal, then redirect to the Stripe billing portal
 * (where the user manages their card / payment method and cancels). */
export async function openBillingPortal(): Promise<void> {
  const url = await requestRedirectUrl("/api/stripe/portal");
  window.location.href = url;
}
