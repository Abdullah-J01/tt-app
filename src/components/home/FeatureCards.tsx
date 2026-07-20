"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { useTranslations } from "@/i18n/client";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, BookOpen, Smartphone, Flame, Users, Trophy } from "lucide-react";
import FeatureCard from "./FeatureCard";
import {
  FloatingShard,
  FloatingBook,
  FloatingDevices,
  FloatingRings,
  FloatingPrism,
  FloatingStack,
} from "../three/Illustrations";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Zap,
    titleKey: "card1Title",
    descriptionKey: "card1Body",
    gradient: "bg-violet-gradient",
    illustration: <FloatingShard />,
  },
  {
    icon: BookOpen,
    titleKey: "card2Title",
    descriptionKey: "card2Body",
    gradient: "bg-green-gradient",
    illustration: <FloatingBook />,
  },
  {
    icon: Smartphone,
    titleKey: "card3Title",
    descriptionKey: "card3Body",
    gradient: "bg-plum-gradient",
    illustration: <FloatingDevices />,
  },
  {
    icon: Users,
    titleKey: "card4Title",
    descriptionKey: "card4Body",
    gradient: "bg-violet-gradient",
    illustration: <FloatingStack />,
  },
  {
    icon: Trophy,
    titleKey: "card5Title",
    descriptionKey: "card5Body",
    gradient: "bg-green-gradient",
    illustration: <FloatingPrism />,
  },
  {
    icon: Flame,
    titleKey: "card6Title",
    descriptionKey: "card6Body",
    gradient: "bg-plum-gradient",
    illustration: <FloatingRings />,
  },
];

/* ===========================================================================
 * MOBILE STACK — physics
 *
 * One continuous `progress` motion value (a fractional card index) describes
 * the whole stack. Card i reads its own depth = progress - i:
 *
 *   depth < 0   not dealt yet — parked off to the RIGHT, slides in ON TOP
 *   depth = 0   the top card, flat and fully lit
 *   depth > 0   buried — sinks down, shrinks and dims as cards land on it
 *
 * Because z-index is just the card index, a higher-index card is always above
 * a lower one, so the incoming card genuinely lands *on top* of the stack and
 * the reverse swipe lifts it back off. Nothing reorders; the mirror is exact.
 * ======================================================================== */
const MAX_DEPTH = 3; // deeper than this and there's nothing left to see
// Buried cards scale from their BOTTOM edge (origin-bottom below), so shrinking
// no longer claws back the sink offset — each layer peeks exactly DEPTH_Y px
// below the one above it regardless of card height. Scaling about the centre
// cancelled ~9px of a 16px sink and the stack read as a single card.
const DEPTH_Y = 14; // px of visible edge per buried layer
const DEPTH_SCALE = 0.045; // 100% -> 95.5% -> 91% -> 86.5%
const DEPTH_FADE = 0.14;
const FLICK = 0.4; // px/ms — above this a short swipe still advances
const RUBBER = 0.35; // resistance past the first/last card
const SPRING = { type: "spring", stiffness: 260, damping: 32, mass: 0.9 } as const;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

function StackCard({
  progress,
  index,
  travel,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  travel: number;
  children: React.ReactNode;
}) {
  const depth = useTransform(progress, (p) => p - index);
  // Buried depth, clamped — drives everything that reads as "under the stack".
  const under = useTransform(depth, (d) => clamp(d, 0, MAX_DEPTH));

  // Only undealt cards travel on X; buried ones stay put and sink instead.
  const x = useTransform(depth, (d) => (d < 0 ? -d * travel : 0));
  const y = useTransform(under, (d) => d * DEPTH_Y);
  const scale = useTransform(under, (d) => 1 - d * DEPTH_SCALE);
  const opacity = useTransform(under, (d) => 1 - d * DEPTH_FADE);

  return (
    <motion.div
      // Grid cell instead of `absolute`: every card shares one cell, so the row
      // sizes itself to the tallest card and nothing needs measuring to avoid
      // clipping. x/y/scale/opacity are all compositor-only properties.
      className="col-start-1 row-start-1 origin-bottom will-change-transform"
      style={{ x, y, scale, opacity, zIndex: index }}
    >
      {children}
    </motion.div>
  );
}

export default function FeatureCards() {
  const t = useTranslations("components_home_FeatureCards");
  const sectionRef = useRef<HTMLElement>(null); // desktop: pinned to the viewport
  const trackRef = useRef<HTMLDivElement>(null); // desktop: the wide row we slide on X

  // Mobile: the card stack. `progress` is the single fractional-index value
  // every card reads; `active` only mirrors it for the dots and the render-loop
  // gating, so it changes once per settle rather than once per frame.
  const stageRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const [active, setActive] = useState(0);
  const [travel, setTravel] = useState(0);
  const animRef = useRef<AnimationPlaybackControls | null>(null);
  const dragRef = useRef<{
    id: number;
    startX: number;
    startProgress: number;
    lastX: number;
    lastT: number;
    velocity: number;
  } | null>(null);

  // useLayoutEffect, not useEffect: ScrollTrigger's `pin` REPARENTS the section
  // into a generated `.pin-spacer` div, so the DOM tree stops matching the one
  // React committed (React still thinks <section> is a direct child of <main>).
  // Layout-effect cleanup runs synchronously *before* React removes host nodes,
  // so mm.revert() unwraps the spacer in time; a passive useEffect cleanup runs
  // after the removal, and React's removeChild then throws NotFoundError.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;

    const mm = gsap.matchMedia();

    // =========================================================================
    // DESKTOP / TABLET — unchanged pinned scroll-jack row.
    // Gated on md+ width AND prefers-reduced-motion so behavior is identical
    // to before; reduced-motion users still fall back to native overflow-x-auto.
    // =========================================================================
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      if (!section || !track) return;

      section.style.overflowX = "hidden";

      const getScrollAmount = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const HOLD_RATIO = 0.25;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getScrollAmount() * (1 + HOLD_RATIO)}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      tl.to(track, {
        x: () => -getScrollAmount(),
        ease: "none",
        duration: 1,
      });
      tl.to({}, { duration: HOLD_RATIO });

      ScrollTrigger.refresh();

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        section.style.overflowX = "";
      };
    });

    return () => mm.revert();
  }, []);

  // =========================================================================
  // MOBILE — direct manipulation. While a finger is down, `progress` is set
  // straight from the pointer delta, so the stack tracks the hand exactly;
  // on release a single spring carries it to the nearest card.
  //
  // The old rig did the opposite: it read scrollLeft off an invisible proxy
  // scroller and fed GSAP `quickTo`, which *eases toward* its target over
  // 0.55s. The cards therefore trailed the finger by half a second and kept
  // drifting after the snap had already settled — the slow, gluey swipe.
  // Easing belongs on release, never during the drag.
  // =========================================================================
  // Layout effect so `travel` is known before first paint — measuring in a
  // passive effect leaves every undealt card sitting at x=0 for one frame,
  // which flashes the whole stack on top of itself.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    // One card-width of travel plus a little clearance, so an undealt card is
    // fully off-stage at depth -1 no matter the viewport.
    const measure = () => setTravel(stage.getBoundingClientRect().width + 24);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const target = clamp(i, 0, features.length - 1);
      animRef.current?.stop();
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      animRef.current = animate(progress, target, reduced ? { duration: 0 } : SPRING);
      setActive(target);
    },
    [progress]
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!travel) return;
    animRef.current?.stop(); // catch the stack mid-flight, like grabbing a book
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startProgress: progress.get(),
      lastX: e.clientX,
      lastT: e.timeStamp,
      velocity: 0,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;

    const dt = e.timeStamp - drag.lastT;
    if (dt > 0) drag.velocity = (e.clientX - drag.lastX) / dt;
    drag.lastX = e.clientX;
    drag.lastT = e.timeStamp;

    // Dragging left (negative delta) pulls the next card in -> progress rises.
    const raw = drag.startProgress - (e.clientX - drag.startX) / travel;
    const last = features.length - 1;
    progress.set(
      raw < 0 ? raw * RUBBER : raw > last ? last + (raw - last) * RUBBER : raw
    );
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    dragRef.current = null;

    // A fast flick advances one card even if it barely moved; otherwise the
    // stack settles to whichever card it's closest to.
    goTo(
      Math.abs(drag.velocity) > FLICK
        ? Math.round(drag.startProgress) + (drag.velocity < 0 ? 1 : -1)
        : Math.round(progress.get())
    );
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    goTo(active + (e.key === "ArrowRight" ? 1 : -1));
  };

  return (
    <section ref={sectionRef} className="relative">
      {/* ---------------------------------------------------------------- */}
      {/* DESKTOP / TABLET — original markup, untouched                    */}
      {/* ---------------------------------------------------------------- */}
      <div className="hidden h-screen [scrollbar-width:none] items-center overflow-x-auto [-ms-overflow-style:none] md:flex [&::-webkit-scrollbar]:hidden">
        <div ref={trackRef} className="flex w-max gap-5 px-[6vw] will-change-transform sm:gap-6">
          {features.map((f, i) => (
            <div key={f.titleKey} className="w-fit shrink-0">
              <FeatureCard
                icon={f.icon}
                title={t(f.titleKey)}
                description={t(f.descriptionKey)}
                gradient={f.gradient}
                index={i}
                illustration={f.illustration}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* MOBILE — a stack of cards. Swiping right-to-left deals the next    */}
      {/* card in from the right and lands it ON TOP; left-to-right lifts it */}
      {/* back off, revealing the one beneath. See the physics notes above.  */}
      {/* ---------------------------------------------------------------- */}
      {/* overflow-x-clip (not -hidden) keeps undealt cards parked off-stage
          without turning this into a vertical scroll container. */}
      <div className="overflow-x-clip md:hidden">
        <div
          ref={stageRef}
          role="group"
          aria-roledescription="carousel"
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onKeyDown={onKeyDown}
          // touch-pan-y hands vertical page scrolling back to the browser and
          // keeps only the horizontal axis for us — without it the stack
          // swallows the swipe and the page feels stuck. select-none stops a
          // drag from smearing a text selection across the card it's moving.
          // pb clears the deepest buried layer (MAX_DEPTH * DEPTH_Y).
          className="mx-auto grid w-[82vw] touch-pan-y pt-10 pb-14 outline-none select-none"
        >
          {features.map((f, i) => (
            <StackCard key={f.titleKey} progress={progress} index={i} travel={travel}>
              {/* animateIn off: these arrive under the user's finger, so the
                  staggered fade-up would just delay the card being dragged in.
                  live only on top: buried scenes freeze on one static frame. */}
              <FeatureCard
                icon={f.icon}
                title={t(f.titleKey)}
                description={t(f.descriptionKey)}
                gradient={f.gradient}
                index={i}
                illustration={f.illustration}
                animateIn={false}
                live={i === active}
              />
            </StackCard>
          ))}
        </div>

        {/* Dots double as jump targets, so the stack is reachable without a
            swipe (and by keyboard via the stage's arrow keys). */}
        <div className="mt-4 flex justify-center gap-2">
          {features.map((f, i) => (
            <button
              key={f.titleKey}
              type="button"
              onClick={() => goTo(i)}
              aria-label={t(f.titleKey)}
              aria-current={i === active}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition duration-300",
                i === active ? "bg-ink scale-150" : "bg-ink/30"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
