"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Crown, Sparkles, X, Zap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);
}

const easeOut = [0.22, 1, 0.36, 1] as const;

type Cycle = "monthly" | "yearly";

type PlanId = "free" | "scholar" | "genius";

interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  icon: React.ReactNode;
  monthly: number;
  yearly: number; // per month, billed yearly
  popular?: boolean;
  gradient: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Dip a toe in",
    icon: <Sparkles className="h-5 w-5" />,
    monthly: 0,
    yearly: 0,
    gradient: "from-[#8A8A9E] to-[#B7B7C6]",
    features: [
      "15 flashcards a day",
      "2 subjects unlocked",
      "20 saved cards",
      "Ads between sessions",
    ],
  },
  {
    id: "scholar",
    name: "Scholar",
    tagline: "For steady study habits",
    icon: <Zap className="h-5 w-5" />,
    monthly: 6,
    yearly: 4.5,
    popular: true,
    gradient: "from-violet to-violet-dark",
    features: [
      "Unlimited flashcards",
      "All subjects unlocked",
      "Unlimited saved cards",
      "Ad-free, always",
      "Offline studybooks",
    ],
  },
  {
    id: "genius",
    name: "Genius",
    tagline: "For the exam-week grind",
    icon: <Crown className="h-5 w-5" />,
    monthly: 12,
    yearly: 9,
    gradient: "from-[#5A3ED0] to-[#B0793B]",
    features: [
      "Everything in Scholar",
      "Personal study plans",
      "Progress analytics",
      "Priority support",
      "Early access to new subjects",
    ],
  },
];

type FeatureValue = boolean | string;

interface FeatureRow {
  label: string;
  values: Record<PlanId, FeatureValue>;
}

const FEATURE_ROWS: FeatureRow[] = [
  {
    label: "Daily flashcards",
    values: { free: "15/day", scholar: "Unlimited", genius: "Unlimited" },
  },
  {
    label: "Subjects unlocked",
    values: { free: "2 subjects", scholar: "All subjects", genius: "All subjects" },
  },
  { label: "Saved cards", values: { free: "20", scholar: "Unlimited", genius: "Unlimited" } },
  { label: "Studybook library", values: { free: false, scholar: true, genius: true } },
  { label: "Offline access", values: { free: false, scholar: true, genius: true } },
  { label: "Ad-free", values: { free: false, scholar: true, genius: true } },
  { label: "Personal study plans", values: { free: false, scholar: false, genius: true } },
  { label: "Progress analytics", values: { free: false, scholar: false, genius: true } },
  { label: "Priority support", values: { free: false, scholar: false, genius: true } },
];

// Index of the "Scholar" (recommended) column within the 4-col grid (Feature, Free, Scholar, Genius)
const HIGHLIGHT_COL_INDEX = 2;

export default function PremiumPlansPage() {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [stickyToggle, setStickyToggle] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsWrapRef = useRef<HTMLDivElement>(null);
  const tableRowsRef = useRef<HTMLDivElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);
  const blobARef = useRef<HTMLDivElement>(null);
  const blobBRef = useRef<HTMLDivElement>(null);
  const curvePathRef = useRef<SVGPathElement>(null);
  const curveDotRef = useRef<SVGCircleElement>(null);

  const savingsLabel = useMemo(() => {
    const p = PLANS.find((p) => p.id === "genius")!;
    const pct = Math.round((1 - p.yearly / p.monthly) * 100);
    return `Save ${pct}%`;
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Ambient parallax on the background blobs (nested so it composes
        // cleanly with the existing Framer Motion float animation instead
        // of both fighting over `transform`).
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

        // Pricing cards flip in like a flashcard being turned over.
        const cards = gsap.utils.toArray<HTMLElement>("[data-plan-card]");
        gsap.set(cards, { transformPerspective: 1400, opacity: 0, rotateY: -110 });
        gsap.to(cards, {
          rotateY: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.16,
          scrollTrigger: {
            trigger: cardsWrapRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });

        // Curve connecting the three plans draws in as you scroll past
        // them, with a dot riding along it — a little "study path" from
        // Free to Genius.
        if (curvePathRef.current) {
          gsap.set(curvePathRef.current, { drawSVG: "0%" });
          const curveTl = gsap.timeline({
            scrollTrigger: {
              trigger: cardsWrapRef.current,
              start: "top 70%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          });
          curveTl.to(curvePathRef.current, { drawSVG: "100%", ease: "none" }, 0);
          if (curveDotRef.current) {
            curveTl.to(
              curveDotRef.current,
              {
                motionPath: {
                  path: curvePathRef.current,
                  align: curvePathRef.current,
                  alignOrigin: [0.5, 0.5],
                },
                ease: "none",
              },
              0,
            );
          }
        }

        // Highlighter sweep down the recommended column, like tracking a
        // line while reading study notes.
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

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-plan-card]", { opacity: 1, rotateY: 0 });
        if (curvePathRef.current) gsap.set(curvePathRef.current, { drawSVG: "100%" });
        if (curveDotRef.current) gsap.set(curveDotRef.current, { opacity: 0 });
      });

      // Toggle the compact sticky billing switch once the hero scrolls away.
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "bottom top+=72",
        onEnter: () => setStickyToggle(true),
        onLeaveBack: () => setStickyToggle(false),
      });
    }, rootRef);

    return () => ctx.revert();
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
          className="from-violet/20 h-full w-full rounded-full bg-gradient-to-br to-transparent blur-3xl"
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
          className="bg-lavender h-full w-full rounded-full blur-3xl"
          animate={{ y: [0, -14, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Header + billing toggle (hero) */}
      <div ref={heroRef}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="relative text-center"
        >
          <Pill className="bg-lavender text-violet mx-auto w-fit">Premium</Pill>
          <h1 className="text-ink mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Study more, forget less
          </h1>
          <p className="text-muted mx-auto mt-3 max-w-md text-sm md:text-base">
            Pick a plan that keeps up with how you actually study. Cancel anytime.
          </p>
        </motion.div>

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
              Monthly
            </CycleButton>
            <CycleButton
              active={cycle === "yearly"}
              onClick={() => setCycle("yearly")}
              layoutKey="cycle-pill"
            >
              Yearly
            </CycleButton>
          </div>
          <AnimatePresence>
            {cycle === "yearly" && (
              <motion.span
                initial={{ opacity: 0, scale: 0.7, x: -6 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.7, x: -6 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="rounded-full bg-[#2F8F4E]/10 px-2.5 py-1 text-[11px] font-semibold text-[#2F8F4E]"
              >
                {savingsLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Pricing cards — flip in on scroll, like turning over a flashcard */}
      <div
        ref={cardsWrapRef}
        className="relative mt-10 grid grid-cols-1 gap-6 [perspective:1600px] sm:grid-cols-3"
      >
        {/* Curved "study path" connecting Free → Scholar → Genius, draws in on scroll */}
        <svg
          aria-hidden
          viewBox="0 0 100 45"
          preserveAspectRatio="none"
          className="text-violet/50 pointer-events-none absolute inset-x-0 top-1/2 z-0 hidden h-16 w-full -translate-y-1/2 sm:block"
        >
          <path
            ref={curvePathRef}
            d="M 8 40 C 29 4, 71 4, 92 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle ref={curveDotRef} cx="8" cy="40" r="1.6" fill="currentColor" />
        </svg>

        {PLANS.map((plan) => (
          <PricingCard key={plan.id} plan={plan} cycle={cycle} />
        ))}
      </div>
    </div>
  );
}

function PricingCard({ plan, cycle }: { plan: Plan; cycle: Cycle }) {
  const price = cycle === "monthly" ? plan.monthly : plan.yearly;

  return (
    <motion.div
      data-plan-card
      style={{ opacity: 0 }}
      whileHover={{ y: plan.popular ? -10 : -6 }}
      transition={{ duration: 0.25, ease: easeOut }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl p-6 ring-1 [transform-style:preserve-3d]",
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
          Most popular
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
        {plan.name}
      </h3>
      <p className={cn("relative mt-1 text-sm", plan.popular ? "text-white/60" : "text-muted")}>
        {plan.tagline}
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
            /month{cycle === "yearly" ? ", billed yearly" : ""}
          </span>
        )}
      </div>

      <ul className="relative mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                plan.popular ? "bg-white/15" : "bg-violet/10",
              )}
            >
              <Check className={cn("h-2.5 w-2.5", plan.popular ? "text-white" : "text-violet")} />
            </span>
            <span className={cn("text-sm", plan.popular ? "text-white/80" : "text-ink/80")}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="relative mt-6">
        <Button
          className={cn(
            "w-full",
            plan.popular ? "text-violet bg-white hover:bg-white/90" : undefined,
          )}
        >
          {plan.id === "free" ? "Current plan" : `Choose ${plan.name}`}
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
        active ? "text-white" : "text-ink hover:text-violet",
      )}
    >
      {active && (
        <motion.span
          layoutId={layoutKey}
          className="bg-violet absolute inset-0 rounded-full"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </Button>
  );
}
