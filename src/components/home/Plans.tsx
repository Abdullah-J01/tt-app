// "use client";

// import { useLayoutEffect, useMemo, useRef, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { Check, Crown, Sparkles, X, Zap } from "lucide-react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/Button";
// import { Pill } from "@/components/ui/Pill";

// if (typeof window !== "undefined") {
//   gsap.registerPlugin(ScrollTrigger);
// }

// const easeOut = [0.22, 1, 0.36, 1] as const;

// type Cycle = "monthly" | "yearly";

// type PlanId = "free" | "scholar" | "genius";

// interface Plan {
//   id: PlanId;
//   name: string;
//   tagline: string;
//   icon: React.ReactNode;
//   monthly: number;
//   yearly: number; // per month, billed yearly
//   popular?: boolean;
//   gradient: string;
//   features: string[];
// }

// const PLANS: Plan[] = [
//   {
//     id: "free",
//     name: "Free",
//     tagline: "Dip a toe in",
//     icon: <Sparkles className="h-5 w-5" />,
//     monthly: 0,
//     yearly: 0,
//     gradient: "from-[#8A8A9E] to-[#B7B7C6]",
//     features: [
//       "15 flashcards a day",
//       "2 subjects unlocked",
//       "20 saved cards",
//       "Ads between sessions",
//     ],
//   },
//   {
//     id: "scholar",
//     name: "Scholar",
//     tagline: "For steady study habits",
//     icon: <Zap className="h-5 w-5" />,
//     monthly: 6,
//     yearly: 4.5,
//     popular: true,
//     gradient: "from-violet to-violet-dark",
//     features: [
//       "Unlimited flashcards",
//       "All subjects unlocked",
//       "Unlimited saved cards",
//       "Ad-free, always",
//       "Offline studybooks",
//     ],
//   },
//   {
//     id: "genius",
//     name: "Genius",
//     tagline: "For the exam-week grind",
//     icon: <Crown className="h-5 w-5" />,
//     monthly: 12,
//     yearly: 9,
//     gradient: "from-[#5A3ED0] to-[#B0793B]",
//     features: [
//       "Everything in Scholar",
//       "Personal study plans",
//       "Progress analytics",
//       "Priority support",
//       "Early access to new subjects",
//     ],
//   },
// ];

// type FeatureValue = boolean | string;

// interface FeatureRow {
//   label: string;
//   values: Record<PlanId, FeatureValue>;
// }

// const FEATURE_ROWS: FeatureRow[] = [
//   {
//     label: "Daily flashcards",
//     values: { free: "15/day", scholar: "Unlimited", genius: "Unlimited" },
//   },
//   {
//     label: "Subjects unlocked",
//     values: { free: "2 subjects", scholar: "All subjects", genius: "All subjects" },
//   },
//   { label: "Saved cards", values: { free: "20", scholar: "Unlimited", genius: "Unlimited" } },
//   { label: "Studybook library", values: { free: false, scholar: true, genius: true } },
//   { label: "Offline access", values: { free: false, scholar: true, genius: true } },
//   { label: "Ad-free", values: { free: false, scholar: true, genius: true } },
//   { label: "Personal study plans", values: { free: false, scholar: false, genius: true } },
//   { label: "Progress analytics", values: { free: false, scholar: false, genius: true } },
//   { label: "Priority support", values: { free: false, scholar: false, genius: true } },
// ];

// // Index of the "Scholar" (recommended) column within the 4-col grid (Feature, Free, Scholar, Genius)
// const HIGHLIGHT_COL_INDEX = 2;

// export default function PremiumPlansPage() {
//   const [cycle, setCycle] = useState<Cycle>("monthly");
//   const [stickyToggle, setStickyToggle] = useState(false);

//   const rootRef = useRef<HTMLDivElement>(null);
//   const heroRef = useRef<HTMLDivElement>(null);
//   const cardsWrapRef = useRef<HTMLDivElement>(null);
//   const tableRowsRef = useRef<HTMLDivElement>(null);
//   const highlighterRef = useRef<HTMLDivElement>(null);
//   const blobARef = useRef<HTMLDivElement>(null);
//   const blobBRef = useRef<HTMLDivElement>(null);

//   const savingsLabel = useMemo(() => {
//     const p = PLANS.find((p) => p.id === "genius")!;
//     const pct = Math.round((1 - p.yearly / p.monthly) * 100);
//     return `Save ${pct}%`;
//   }, []);

//   useLayoutEffect(() => {
//     const ctx = gsap.context(() => {
//       const mm = gsap.matchMedia();

//       mm.add("(prefers-reduced-motion: no-preference)", () => {
//         // Ambient parallax on the background blobs (nested so it composes
//         // cleanly with the existing Framer Motion float animation instead
//         // of both fighting over `transform`).
//         gsap.to(blobARef.current, {
//           yPercent: 45,
//           ease: "none",
//           scrollTrigger: {
//             trigger: rootRef.current,
//             start: "top top",
//             end: "bottom bottom",
//             scrub: 1,
//           },
//         });
//         gsap.to(blobBRef.current, {
//           yPercent: -30,
//           ease: "none",
//           scrollTrigger: {
//             trigger: rootRef.current,
//             start: "top top",
//             end: "bottom bottom",
//             scrub: 1,
//           },
//         });

//         // Highlighter sweep down the recommended column, like tracking a
//         // line while reading study notes.
//         if (highlighterRef.current && tableRowsRef.current) {
//           gsap.fromTo(
//             highlighterRef.current,
//             { top: "0%", opacity: 0 },
//             {
//               top: "85%",
//               opacity: 1,
//               ease: "none",
//               scrollTrigger: {
//                 trigger: tableRowsRef.current,
//                 start: "top 65%",
//                 end: "bottom 65%",
//                 scrub: 0.6,
//               },
//             },
//           );
//         }
//       });

//       // Pricing cards: scroll-scrubbed deck spread. The three cards start
//       // stacked (sides tucked behind Scholar with an edge peeking), then the
//       // sides glide out to their grid slots along a shallow arc, in lockstep
//       // with scroll — reversing the scroll replays it backwards for free.
//       // Transforms live on the [data-plan-slide] wrappers so they never fight
//       // the Framer Motion hover-lift on the cards themselves.
//       mm.add("(min-width: 640px) and (prefers-reduced-motion: no-preference)", () => {
//         const [leftCard, centerCard, rightCard] =
//           gsap.utils.toArray<HTMLElement>("[data-plan-slide]");
//         const wrap = cardsWrapRef.current;
//         if (!leftCard || !centerCard || !rightCard || !wrap) return;

//         const PEEK = 36; // px of a tucked card's outer edge left showing
//         const ARC = 22; // px of vertical rise at mid-flight (the curve)

//         // Offset that moves a side card from its grid slot to just behind the
//         // center card, stopping PEEK px short so its outer edge stays visible.
//         const stackedX = (el: HTMLElement) => {
//           const dx = centerCard.offsetLeft - el.offsetLeft;
//           return dx - Math.sign(dx) * PEEK;
//         };

//         const tl = gsap.timeline({
//           scrollTrigger: {
//             trigger: wrap,
//             // Spread starts the moment the cards begin entering the viewport
//             // and completes as they become fully visible (one section-height
//             // of travel) — clamped so it still finishes near the bottom of
//             // short pages / on tall viewports where that much scroll room
//             // doesn't exist below the section.
//             start: "top bottom",
//             end: () => {
//               const startPos = wrap.getBoundingClientRect().top + window.scrollY - window.innerHeight;
//               const travel = Math.min(wrap.offsetHeight, ScrollTrigger.maxScroll(window) - startPos);
//               return startPos + Math.max(travel, 1);
//             },
//             scrub: 0.8,
//             invalidateOnRefresh: true,
//           },
//         });

//         for (const el of [leftCard, rightCard]) {
//           const dir = el === leftCard ? -1 : 1;
//           tl.fromTo(
//             el,
//             {
//               x: () => stackedX(el),
//               scale: 0.94,
//               rotation: dir * 3,
//               transformOrigin: "50% 100%",
//             },
//             { x: 0, scale: 1, rotation: 0, duration: 1, ease: "sine.inOut" },
//             0,
//           );
//           // Shallow rise-and-settle on y turns the straight slide into an arc.
//           tl.to(el, { keyframes: { y: [0, -ARC, 0], easeEach: "sine.inOut" }, duration: 1 }, 0);
//         }
//       });

//       // Single-column mobile: the deck metaphor doesn't apply, so cards just
//       // rise in softly as they enter, and reverse when scrolled back out.
//       mm.add("(max-width: 639px) and (prefers-reduced-motion: no-preference)", () => {
//         gsap.utils.toArray<HTMLElement>("[data-plan-slide]").forEach((el) => {
//           gsap.fromTo(
//             el,
//             { opacity: 0, y: 28 },
//             {
//               opacity: 1,
//               y: 0,
//               duration: 0.6,
//               ease: "power2.out",
//               scrollTrigger: {
//                 trigger: el,
//                 start: "top 88%",
//                 toggleActions: "play none none reverse",
//               },
//             },
//           );
//         });
//       });

//       // Toggle the compact sticky billing switch once the hero scrolls away.
//       ScrollTrigger.create({
//         trigger: heroRef.current,
//         start: "bottom top+=72",
//         onEnter: () => setStickyToggle(true),
//         onLeaveBack: () => setStickyToggle(false),
//       });
//     }, rootRef);

//     // The landing page lazy-mounts the sections above this one (hero, feature
//     // cards, carousels), so the document grows after ScrollTrigger's initial
//     // measurement. Worse, the FeatureCards *pinned* trigger is created after
//     // ours, so without re-sorting, our triggers refresh before the pin and
//     // miss its ~1.6k px spacer offset — everything here would fire far too
//     // early. Re-sort into document order and re-measure whenever the page
//     // height changes.
//     let lastHeight = document.documentElement.scrollHeight;
//     const resizeObserver = new ResizeObserver(() => {
//       const height = document.documentElement.scrollHeight;
//       if (height !== lastHeight) {
//         lastHeight = height;
//         ScrollTrigger.sort();
//         ScrollTrigger.refresh();
//       }
//     });
//     resizeObserver.observe(document.body);

//     return () => {
//       resizeObserver.disconnect();
//       ctx.revert();
//     };
//   }, []);

//   return (
//     <div
//       ref={rootRef}
//       className="relative mx-auto min-h-screen max-w-5xl overflow-hidden bg-white px-4 py-10 pb-24 md:py-16"
//     >
//       <div
//         ref={blobARef}
//         aria-hidden
//         className="pointer-events-none absolute -top-24 -right-20 h-72 w-72"
//       >
//         <motion.div
//           className=" h-full w-full rounded-full bg-gradient-to-br to-transparent blur-3xl"
//           animate={{ y: [0, 18, 0], opacity: [0.6, 0.9, 0.6] }}
//           transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
//         />
//       </div>
//       <div
//         ref={blobBRef}
//         aria-hidden
//         className="pointer-events-none absolute top-40 -left-24 h-72 w-72"
//       >
//         <motion.div
//           className="h-full w-full rounded-full blur-3xl"
//           animate={{ y: [0, -14, 0], opacity: [0.5, 0.8, 0.5] }}
//           transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//         />
//       </div>

//       {/* Header + billing toggle (hero) */}
//       <div ref={heroRef}>
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, ease: easeOut }}
//           className="relative text-center"
//         >
//           <Pill className="bg-lavender text-violet mx-auto w-fit">Premium</Pill>
//           <h1 className="text-ink mt-4 text-3xl font-bold tracking-tight md:text-4xl">
//             Study more, forget less
//           </h1>
//           <p className="text-muted mx-auto mt-3 max-w-md text-sm md:text-base">
//             Pick a plan that keeps up with how you actually study. Cancel anytime.
//           </p>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: -6 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.45, delay: 0.1, ease: easeOut }}
//           className="relative mt-8 flex items-center justify-center gap-3"
//         >
//           <div className="bg-lavender/50 inline-flex gap-1 rounded-full p-1">
//             <CycleButton
//               active={cycle === "monthly"}
//               onClick={() => setCycle("monthly")}
//               layoutKey="cycle-pill"
//             >
//               Monthly
//             </CycleButton>
//             <CycleButton
//               active={cycle === "yearly"}
//               onClick={() => setCycle("yearly")}
//               layoutKey="cycle-pill"
//             >
//               Yearly
//             </CycleButton>
//           </div>
//           <AnimatePresence>
//             {cycle === "yearly" && (
//               <motion.span
//                 initial={{ opacity: 0, scale: 0.7, x: -6 }}
//                 animate={{ opacity: 1, scale: 1, x: 0 }}
//                 exit={{ opacity: 0, scale: 0.7, x: -6 }}
//                 transition={{ type: "spring", stiffness: 350, damping: 20 }}
//                 className="rounded-full bg-[#2F8F4E]/10 px-2.5 py-1 text-[11px] font-semibold text-[#2F8F4E]"
//               >
//                 {savingsLabel}
//               </motion.span>
//             )}
//           </AnimatePresence>
//         </motion.div>
//       </div>

//       {/* Pricing cards — start stacked behind Scholar, spread apart on scroll */}
//       <div ref={cardsWrapRef} className="relative mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
//         {PLANS.map((plan) => (
//           // GSAP animates this wrapper; the card inside keeps its own Framer
//           // Motion hover transform. `grid` makes the card fill the slot so all
//           // three stay equal height. The popular (center) card sits on top of
//           // the deck while the sides are tucked behind it.
//           <div
//             key={plan.id}
//             data-plan-slide
//             className={cn("relative grid", plan.popular ? "z-[2]" : "z-[1]")}
//           >
//             <PricingCard plan={plan} cycle={cycle} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function PricingCard({ plan, cycle }: { plan: Plan; cycle: Cycle }) {
//   const price = cycle === "monthly" ? plan.monthly : plan.yearly;

//   return (
//     <motion.div
//       data-plan-card
//       whileHover={{ y: plan.popular ? -10 : -6 }}
//       transition={{ duration: 0.25, ease: easeOut }}
//       className={cn(
//         "group relative flex flex-col overflow-hidden rounded-3xl p-6 ring-1",
//         plan.popular
//           ? "ring-violet/40 shadow-violet/20 bg-plum-gradient shadow-xl"
//           : "bg-white shadow-md ring-black/5",
//       )}
//     >
//       {plan.popular && (
//         <motion.div
//           aria-hidden
//           className="from-violet/30 pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br to-transparent blur-2xl"
//           animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
//           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
//         />
//       )}

//       {plan.popular && (
//         <motion.span
//           initial={{ opacity: 0, y: -6 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3, duration: 0.4, ease: easeOut }}
//           className="bg-violet absolute top-0 right-6 rounded-b-full px-3 py-1 text-[10px] font-semibold tracking-wide text-white uppercase"
//         >
//           Most popular
//         </motion.span>
//       )}

//       <div
//         className={cn(
//           "relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white",
//           plan.gradient,
//         )}
//       >
//         {plan.icon}
//       </div>

//       <h3
//         className={cn("relative mt-4 text-lg font-bold", plan.popular ? "text-white" : "text-ink")}
//       >
//         {plan.name}
//       </h3>
//       <p className={cn("relative mt-1 text-sm", plan.popular ? "text-white/60" : "text-muted")}>
//         {plan.tagline}
//       </p>

//       <div className="relative mt-5 flex items-end gap-1">
//         <AnimatePresence mode="wait">
//           <motion.span
//             key={`${plan.id}-${cycle}`}
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -8 }}
//             transition={{ duration: 0.25, ease: easeOut }}
//             className={cn("text-3xl font-bold", plan.popular ? "text-white" : "text-ink")}
//           >
//             ${price.toFixed(price % 1 === 0 ? 0 : 2)}
//           </motion.span>
//         </AnimatePresence>
//         {price > 0 && (
//           <span className={cn("mb-1 text-xs", plan.popular ? "text-white/50" : "text-muted")}>
//             /month{cycle === "yearly" ? ", billed yearly" : ""}
//           </span>
//         )}
//       </div>

//       <ul className="relative mt-6 flex-1 space-y-3">
//         {plan.features.map((feature) => (
//           <li key={feature} className="flex items-start gap-2.5">
//             <span
//               className={cn(
//                 "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
//                 plan.popular ? "bg-white/15" : "bg-violet/10",
//               )}
//             >
//               <Check className={cn("h-2.5 w-2.5", plan.popular ? "text-white" : "text-violet")} />
//             </span>
//             <span className={cn("text-sm", plan.popular ? "text-white/80" : "text-ink/80")}>
//               {feature}
//             </span>
//           </li>
//         ))}
//       </ul>

//       <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="relative mt-6">
//         <Button
//           className={cn(
//             "w-full",
//             plan.popular ? "text-violet bg-white hover:bg-white/90" : undefined,
//           )}
//         >
//           {plan.id === "free" ? "Current plan" : `Choose ${plan.name}`}
//         </Button>
//       </motion.div>
//     </motion.div>
//   );
// }

// function CycleButton({
//   active,
//   onClick,
//   children,
//   layoutKey = "cycle-pill",
// }: {
//   active: boolean;
//   onClick: () => void;
//   children: React.ReactNode;
//   layoutKey?: string;
// }) {
//   return (
//     <Button
//       unstyled
//       onClick={onClick}
//       className={cn(
//         "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
//         active ? "text-white" : "text-ink hover:text-violet",
//       )}
//     >
//       {active && (
//         <motion.span
//           layoutId={layoutKey}
//           className="bg-violet absolute inset-0 rounded-full"
//           transition={{ type: "spring", stiffness: 350, damping: 30 }}
//         />
//       )}
//       <span className="relative z-10">{children}</span>
//     </Button>
//   );
// }

"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "@/i18n/client";
import type { Translator } from "@/i18n/types";

import { Check, Crown, Loader2, Sparkles, X, Zap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { isPaidPlan, type Cycle as BillingCycle, type PaidPlanId } from "@/lib/plans";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
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
    name: "freeName",
    tagline: "freeTagline",
    icon: <Sparkles className="h-5 w-5" />,
    monthly: 0,
    yearly: 0,
    gradient: "from-[#8A8A9E] to-[#B7B7C6]",
    features: ["freeFeat1", "freeFeat2", "freeFeat3", "freeFeat4"],
  },
  {
    id: "scholar",
    name: "scholarName",
    tagline: "scholarTagline",
    icon: <Zap className="h-5 w-5" />,
    monthly: 6,
    yearly: 4.5,
    popular: true,
    gradient: "from-violet to-violet-dark",
    features: ["scholarFeat1", "scholarFeat2", "scholarFeat3", "scholarFeat4", "scholarFeat5"],
  },
  {
    id: "genius",
    name: "geniusName",
    tagline: "geniusTagline",
    icon: <Crown className="h-5 w-5" />,
    monthly: 12,
    yearly: 9,
    gradient: "from-[#5A3ED0] to-[#B0793B]",
    features: ["geniusFeat1", "geniusFeat2", "geniusFeat3", "geniusFeat4", "geniusFeat5"],
  },
];

// --- Trial / subscription status -------------------------------------------------

type SubStatus =
  | { status: "loading" }
  | { status: "signed_out" | "none" }
  | {
      status: "trialing" | "active" | "past_due" | "canceled" | "unpaid" | string;
      trialEnd: number | null;
      currentPeriodEnd: number;
      planId: PlanId | null;
      cycle: Cycle | null;
      cancelAtPeriodEnd: boolean;
    };

function useSubscriptionStatus() {
  const [state, setState] = useState<SubStatus>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stripe/status")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setState(data);
      })
      .catch(() => {
        if (!cancelled) setState({ status: "none" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

function daysLeft(timestampMs: number) {
  return Math.max(0, Math.ceil((timestampMs - Date.now()) / (1000 * 60 * 60 * 24)));
}

// Index of the "Scholar" (recommended) column within the 4-col grid (Feature, Free, Scholar, Genius)
const HIGHLIGHT_COL_INDEX = 2;

export default function PremiumPlansPage() {
  const t = useTranslations("components_home_Plans");
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [stickyToggle, setStickyToggle] = useState(false);
  const [checkingOutPlan, setCheckingOutPlan] = useState<PlanId | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const subStatus = useSubscriptionStatus();

  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsWrapRef = useRef<HTMLDivElement>(null);
  const tableRowsRef = useRef<HTMLDivElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);
  const blobARef = useRef<HTMLDivElement>(null);
  const blobBRef = useRef<HTMLDivElement>(null);

  const savingsLabel = useMemo(() => {
    const p = PLANS.find((p) => p.id === "genius")!;
    const pct = Math.round((1 - p.yearly / p.monthly) * 100);
    return t("savePercent", { pct });
  }, [t]);

  async function handleChoosePlan(planId: PlanId) {
    if (planId === "free" || checkingOutPlan) return;
    if (!isPaidPlan(planId)) return;

    setCheckingOutPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, cycle }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed");
      }
      window.location.href = data.url; // redirect to Stripe Checkout
    } catch (err) {
      console.error(err);
      setCheckingOutPlan(null);
      // Swap for a toast if your app has one.
      alert(t("checkoutError"));
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Portal failed");
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setPortalLoading(false);
      alert(t("portalError"));
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

      {/* Header + billing toggle (hero) */}
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

        {/* Trial / subscription status banner */}
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

      {/* Pricing cards — start stacked behind Scholar, spread apart on scroll */}
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
              onChoose={() => handleChoosePlan(plan.id)}
              loading={checkingOutPlan === plan.id}
              disabled={checkingOutPlan !== null}
              isCurrentPaidPlan={
                "planId" in subStatus &&
                subStatus.planId === plan.id &&
                (subStatus.status === "trialing" || subStatus.status === "active")
              }
            />
          </div>
        ))}
      </div>
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
  if (status.status === "loading" || status.status === "signed_out" || status.status === "none") {
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
        <span>
          {remaining > 0 ? t("trialLeft", { days: remaining }) : t("trialEndsToday")}
        </span>
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
          {status.cancelAtPeriodEnd
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
  onChoose,
  loading,
  disabled,
  isCurrentPaidPlan,
}: {
  plan: Plan;
  cycle: Cycle;
  onChoose: () => void;
  loading: boolean;
  disabled: boolean;
  isCurrentPaidPlan: boolean;
}) {
  const t = useTranslations("components_home_Plans");
  const price = cycle === "monthly" ? plan.monthly : plan.yearly;
  const name = t(plan.name);

  const buttonLabel = isCurrentPaidPlan
    ? t("currentPlan")
    : plan.id === "free"
      ? t("currentPlan")
      : loading
        ? t("redirecting")
        : t("startTrialPlan", { name });

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
        {name}
      </h3>
      <p className={cn("relative mt-1 text-sm", plan.popular ? "text-white/60" : "text-muted")}>
        {t(plan.tagline)}
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
            {cycle === "yearly" ? t("perMonthYearly") : t("perMonthMonthly")}
          </span>
        )}
      </div>

      {plan.id !== "free" && (
        <p className={cn("relative mt-1 text-xs", plan.popular ? "text-white/50" : "text-muted")}>
          {t("cardRenewLine", { price: `$${price.toFixed(price % 1 === 0 ? 0 : 2)}` })}
        </p>
      )}

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
              {t(feature)}
            </span>
          </li>
        ))}
      </ul>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="relative mt-6">
        <Button
          onClick={onChoose}
          disabled={plan.id === "free" || isCurrentPaidPlan || disabled}
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
