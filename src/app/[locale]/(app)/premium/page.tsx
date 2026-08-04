"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Crown, Loader2, Sparkles, Zap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n/client";
import type { Translator } from "@/i18n/types";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { isPaidPlan } from "@/lib/plans";
import {
  BillingError,
  BillingErrorModal,
  daysLeft,
  openBillingPortal,
  planCardAction,
  startCheckout,
  startMaterialCheckout,
  useSubscription,
  type PlanCardAction,
  type PlanCardTarget,
  type SubStatus,
} from "@/features/billing";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const easeOut = [0.22, 1, 0.36, 1] as const;

type Cycle = "monthly" | "yearly";

type PlanId = "free" | "premium" | "material";

interface Plan {
  id: PlanId;

  key: string;
  icon: React.ReactNode;
  monthly: number;

  yearly: number;
  oneTime?: boolean;
  popular?: boolean;
  gradient: string;
  featureKeys: string[];
}

const PLANS: Plan[] = [
  {
    id: "free",
    key: "free",
    icon: <Sparkles className="h-5 w-5" />,
    monthly: 0,
    yearly: 0,
    gradient: "from-[#8A8A9E] to-[#B7B7C6]",
    featureKeys: ["freeFeat1", "freeFeat2", "freeFeat3"],
  },
  {
    id: "premium",
    key: "premium",
    icon: <Zap className="h-5 w-5" />,
    monthly: 4.99,
    yearly: 9.99,
    popular: true,
    gradient: "from-violet to-violet-dark",
    featureKeys: ["premiumFeat1", "premiumFeat2", "premiumFeat3", "premiumFeat4", "premiumFeat5"],
  },
  {
    id: "material",
    key: "material",
    icon: <Crown className="h-5 w-5" />,
    monthly: 2.99,
    yearly: 2.99,
    oneTime: true,
    gradient: "from-[#5A3ED0] to-[#B0793B]",
    featureKeys: ["materialFeat1", "materialFeat2", "materialFeat3"],
  },
];

function planCardTarget(planId: PlanId, cycle: Cycle): PlanCardTarget {
  if (planId === "free") return "free";
  if (planId === "material") return "material";
  return cycle === "yearly" ? "premium-yearly" : "premium-monthly";
}

const HIGHLIGHT_COL_INDEX = 2;

export default function PremiumPlansPage() {
  const t = useTranslations("components_home_Plans");
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [stickyToggle, setStickyToggle] = useState(false);
  const [checkingOutPlan, setCheckingOutPlan] = useState<PlanId | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingError, setBillingError] = useState<BillingError | null>(null);
  const [retry, setRetry] = useState<(() => void) | null>(null);
  const subStatus = useSubscription();
  const syncedCycleRef = useRef(false);
  useEffect(() => {
    if (syncedCycleRef.current) return;
    if ("cycle" in subStatus && subStatus.cycle) {
      syncedCycleRef.current = true;
      setCycle(subStatus.cycle);
    }
  }, [subStatus]);

  function reportBillingError(err: unknown, retryFn: () => void) {
    const billingErr =
      err instanceof BillingError
        ? err
        : new BillingError("Something went wrong. Please try again.", 0);
    console.error(billingErr);
    setRetry(() => retryFn);
    setBillingError(billingErr);
  }

  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsWrapRef = useRef<HTMLDivElement>(null);
  const tableRowsRef = useRef<HTMLDivElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);
  const blobARef = useRef<HTMLDivElement>(null);
  const blobBRef = useRef<HTMLDivElement>(null);

  const savingsLabel = useMemo(() => {
    const p = PLANS.find((p) => p.id === "premium")!;
    const pct = Math.round((1 - p.yearly / (p.monthly * 12)) * 100);
    return t("savePercent", { pct });
  }, [t]);

  async function handleChoosePlan(planId: PlanId) {
    if (planId === "free" || checkingOutPlan) return;

    // Not signed in → prompt to log in before hitting Stripe at all.
    if (subStatus.status === "signed_out") {
      reportBillingError(new BillingError("Please sign in first.", 401), () =>
        handleChoosePlan(planId),
      );
      return;
    }

    setCheckingOutPlan(planId);
    try {
      if (planId === "material") {
        await startMaterialCheckout(); // redirects to Stripe Checkout on success
      } else if (isPaidPlan(planId)) {
        await startCheckout(planId, cycle); // redirects to Stripe Checkout on success
      }
    } catch (err) {
      setCheckingOutPlan(null);
      reportBillingError(err, () => handleChoosePlan(planId));
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      await openBillingPortal();
    } catch (err) {
      setPortalLoading(false);
      reportBillingError(err, () => handleManageBilling());
    }
  }

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(blobARef.current, {
          yPercent: 45,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });
        gsap.to(blobBRef.current, {
          yPercent: -30,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });

        if (highlighterRef.current && tableRowsRef.current) {
          gsap.fromTo(
            highlighterRef.current,
            { top: "0%", opacity: 0 },
            {
              top: "85%",
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: tableRowsRef.current,
                start: "top 65%",
                end: "bottom 65%",
                scrub: 0.6,
              },
            },
          );
        }
      });

      mm.add("(min-width: 640px) and (prefers-reduced-motion: no-preference)", () => {
        const [leftCard, centerCard, rightCard] =
          gsap.utils.toArray<HTMLElement>("[data-plan-slide]");
        const wrap = cardsWrapRef.current;
        if (!leftCard || !centerCard || !rightCard || !wrap) return;

        const PEEK = 36;
        const ARC = 22;

        const stackedX = (el: HTMLElement) => {
          const dx = centerCard.offsetLeft - el.offsetLeft;
          return dx - Math.sign(dx) * PEEK;
        };

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrap,
            start: "top bottom",
            end: () => {
              const startPos =
                wrap.getBoundingClientRect().top + window.scrollY - window.innerHeight;
              const travel = Math.min(
                wrap.offsetHeight,
                ScrollTrigger.maxScroll(window) - startPos,
              );
              return startPos + Math.max(travel, 1);
            },
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        for (const el of [leftCard, rightCard]) {
          const dir = el === leftCard ? -1 : 1;
          tl.fromTo(
            el,
            {
              x: () => stackedX(el),
              scale: 0.94,
              rotation: dir * 3,
              transformOrigin: "50% 100%",
            },
            { x: 0, scale: 1, rotation: 0, duration: 1, ease: "sine.inOut" },
            0,
          );
          tl.to(el, { keyframes: { y: [0, -ARC, 0], easeEach: "sine.inOut" }, duration: 1 }, 0);
        }
      });

      mm.add("(max-width: 639px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-plan-slide]").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            },
          );
        });
      });

      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "bottom top+=72",
        onEnter: () => setStickyToggle(true),
        onLeaveBack: () => setStickyToggle(false),
      });
    }, rootRef);

    let lastHeight = document.documentElement.scrollHeight;
    const resizeObserver = new ResizeObserver(() => {
      const height = document.documentElement.scrollHeight;
      if (height !== lastHeight) {
        lastHeight = height;
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }
    });
    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative mx-auto min-h-screen max-w-5xl overflow-hidden bg-white px-4 py-10 pb-24 md:py-16"
    >
      <div
        ref={blobARef}
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-20 h-72 w-72"
      >
        <motion.div
          className="h-full w-full rounded-full bg-gradient-to-br to-transparent blur-3xl"
          animate={{ y: [0, 18, 0], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div
        ref={blobBRef}
        aria-hidden
        className="pointer-events-none absolute top-40 -left-24 h-72 w-72"
      >
        <motion.div
          className="h-full w-full rounded-full blur-3xl"
          animate={{ y: [0, -14, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div ref={heroRef}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="relative text-center"
        >
          <Pill className="bg-lavender text-violet mx-auto w-fit">{t("premium")}</Pill>
          <h1 className="text-ink mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h1>
          <p className="text-muted mx-auto mt-3 max-w-md text-sm md:text-base">{t("subtitle")}</p>
        </motion.div>

        <TrialBanner
          status={subStatus}
          onManage={handleManageBilling}
          portalLoading={portalLoading}
          t={t}
        />

        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: easeOut }}
          className="relative mt-8 flex items-center justify-center gap-3"
        >
          <div className="bg-lavender/50 inline-flex gap-1 rounded-full p-1">
            <CycleButton
              active={cycle === "monthly"}
              onClick={() => setCycle("monthly")}
              layoutKey="cycle-pill"
            >
              {t("monthly")}
            </CycleButton>
            <CycleButton
              active={cycle === "yearly"}
              onClick={() => setCycle("yearly")}
              layoutKey="cycle-pill"
            >
              {t("yearly")}
            </CycleButton>
          </div>
          <AnimatePresence>
            {/* {cycle === "yearly" && (
              <motion.span
                initial={{ opacity: 0, scale: 0.7, x: -6 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.7, x: -6 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="rounded-full bg-[#2F8F4E]/10 px-2.5 py-1 text-[11px] font-semibold text-[#2F8F4E]"
              >
                {savingsLabel}
              </motion.span>
            )} */}
          </AnimatePresence>
        </motion.div>
      </div>

      <div ref={cardsWrapRef} className="relative mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            data-plan-slide
            className={cn("relative grid", plan.popular ? "z-[2]" : "z-[1]")}
          >
            <PricingCard
              plan={plan}
              cycle={cycle}
              t={t}
              onChoose={() => handleChoosePlan(plan.id)}
              loading={checkingOutPlan === plan.id}
              disabled={checkingOutPlan !== null}
              action={planCardAction(planCardTarget(plan.id, cycle), subStatus)}
            />
          </div>
        ))}
      </div>

      <BillingErrorModal
        error={billingError}
        onClose={() => setBillingError(null)}
        onRetry={retry ?? undefined}
      />
    </div>
  );
}

function TrialBanner({
  status,
  onManage,
  portalLoading,
  t,
}: {
  status: SubStatus;
  onManage: () => void;
  portalLoading: boolean;
  t: Translator;
}) {
  if (!("planId" in status)) {
    return null;
  }

  if (status.status === "trialing" && status.trialEnd) {
    const remaining = daysLeft(status.trialEnd);
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-lavender/60 text-violet relative mx-auto mt-5 flex w-fit items-center gap-3 rounded-full px-4 py-2 text-sm font-medium"
      >
        <span>{remaining > 0 ? t("trialLeft", { days: remaining }) : t("trialEndsToday")}</span>
        <button
          onClick={onManage}
          disabled={portalLoading}
          className="text-violet underline underline-offset-2 disabled:opacity-50"
        >
          {portalLoading ? t("opening") : t("manage")}
        </button>
      </motion.div>
    );
  }

  if (status.status === "active") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto mt-5 flex w-fit items-center gap-3 rounded-full bg-[#2F8F4E]/10 px-4 py-2 text-sm font-medium text-[#2F8F4E]"
      >
        <span>
          {status.cancelAtPeriodEnd && status.currentPeriodEnd
            ? t("subscriptionActiveEnds", { date: new Date(status.currentPeriodEnd) })
            : t("subscribed")}
        </span>
        <button
          onClick={onManage}
          disabled={portalLoading}
          className="underline underline-offset-2 disabled:opacity-50"
        >
          {portalLoading ? t("opening") : t("manage")}
        </button>
      </motion.div>
    );
  }

  if (status.status === "past_due" || status.status === "unpaid") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto mt-5 flex w-fit items-center gap-3 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600"
      >
        <span>{t("paymentFailed")}</span>
        <button
          onClick={onManage}
          disabled={portalLoading}
          className="underline underline-offset-2"
        >
          {portalLoading ? t("opening") : t("updateCard")}
        </button>
      </motion.div>
    );
  }

  return null;
}

function PricingCard({
  plan,
  cycle,
  t,
  onChoose,
  loading,
  disabled,
  action,
}: {
  plan: Plan;
  cycle: Cycle;
  t: Translator;
  onChoose: () => void;
  loading: boolean;
  disabled: boolean;
  action: PlanCardAction;
}) {
  const price = plan.oneTime ? plan.monthly : cycle === "monthly" ? plan.monthly : plan.yearly;
  const planName = t(`${plan.key}Name`);
  const isCurrentPlan = action === "current";

  const buttonLabel =
    action === "current"
      ? t("currentPlan")
      : action === "disabled"
        ? t("unavailable")
        : loading
          ? t("redirecting")
          : action === "upgrade"
            ? t("upgradeTo", { name: planName })
            : plan.id === "free"
              ? t("choose", { name: planName })
              : plan.oneTime
                ? t("unlockMaterial")
                : t("startTrialPlan", { name: planName });

  return (
    <motion.div
      data-plan-card
      whileHover={{ y: plan.popular ? -10 : -6 }}
      transition={{ duration: 0.25, ease: easeOut }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl p-6 ring-1",
        plan.popular
          ? "ring-violet/40 shadow-violet/20 bg-plum-gradient shadow-xl"
          : "bg-white shadow-md ring-black/5",
      )}
    >
      {plan.popular && (
        <motion.div
          aria-hidden
          className="from-violet/30 pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br to-transparent blur-2xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {plan.popular && (
        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: easeOut }}
          className="bg-violet absolute top-0 right-6 rounded-b-full px-3 py-1 text-[10px] font-semibold tracking-wide text-white uppercase"
        >
          {t("mostPopular")}
        </motion.span>
      )}

      <div
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white",
          plan.gradient,
        )}
      >
        {plan.icon}
      </div>

      <h3
        className={cn("relative mt-4 text-lg font-bold", plan.popular ? "text-white" : "text-ink")}
      >
        {planName}
      </h3>
      <p className={cn("relative mt-1 text-sm", plan.popular ? "text-white/60" : "text-muted")}>
        {t(`${plan.key}Tagline`)}
      </p>

      <div className="relative mt-5 flex items-end gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={`${plan.id}-${cycle}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: easeOut }}
            className={cn("text-3xl font-bold", plan.popular ? "text-white" : "text-ink")}
          >
            ${price.toFixed(price % 1 === 0 ? 0 : 2)}
          </motion.span>
        </AnimatePresence>
        {price > 0 && (
          <span className={cn("mb-1 text-xs", plan.popular ? "text-white/50" : "text-muted")}>
            {plan.oneTime
              ? t("perMaterial")
              : cycle === "yearly"
                ? t("perYearBilled")
                : t("perMonthMonthly")}
          </span>
        )}
      </div>

      {plan.id === "premium" && (
        <p className={cn("relative mt-1 text-xs", plan.popular ? "text-white/50" : "text-muted")}>
          {t("cardRenewLine", {
            price: `$${price.toFixed(price % 1 === 0 ? 0 : 2)}${cycle === "yearly" ? "/yr" : "/mo"}`,
          })}
        </p>
      )}
      {plan.oneTime && (
        <p className={cn("relative mt-1 text-xs", plan.popular ? "text-white/50" : "text-muted")}>
          {t("materialNote")}
        </p>
      )}

      <ul className="relative mt-6 flex-1 space-y-3">
        {plan.featureKeys.map((featureKey) => (
          <li key={featureKey} className="flex items-start gap-2.5">
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                plan.popular ? "bg-white/15" : "bg-violet/10",
              )}
            >
              <Check className={cn("h-2.5 w-2.5", plan.popular ? "text-white" : "text-violet")} />
            </span>
            <span className={cn("text-sm", plan.popular ? "text-white/80" : "text-ink/80")}>
              {t(featureKey)}
            </span>
          </li>
        ))}
      </ul>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="relative mt-6">
        <Button
          onClick={onChoose}
          disabled={plan.id === "free" || isCurrentPlan || action === "disabled" || disabled}
          className={cn(
            "w-full",
            plan.popular ? "text-violet bg-white hover:bg-white/90" : undefined,
          )}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {buttonLabel}
        </Button>
      </motion.div>
    </motion.div>
  );
}

function CycleButton({
  active,
  onClick,
  children,
  layoutKey = "cycle-pill",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  layoutKey?: string;
}) {
  return (
    <Button
      unstyled
      onClick={onClick}
      className={cn(
        "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-violet text-white" : "text-ink hover:text-violet",
      )}
    >
      <span className="relative z-10">{children}</span>
    </Button>
  );
}
