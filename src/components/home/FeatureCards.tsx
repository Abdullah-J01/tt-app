"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "@/i18n/client";
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

export default function FeatureCards() {
  const t = useTranslations("components_home_FeatureCards");
  const sectionRef = useRef<HTMLElement>(null); // desktop: pinned to the viewport
  const trackRef = useRef<HTMLDivElement>(null); // desktop: the wide row we slide on X

  // Mobile: horizontally-scrollable track + per-card refs for the stack transform
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const mobileStageRef = useRef<HTMLDivElement>(null); // mobile: holds the layered cards; height synced to tallest card
  const mobileCardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
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

    // =========================================================================
    // MOBILE — plain vertical page scroll. The section itself does NOT pin or
    // hijack scroll. Instead the card row is a native horizontally-swipeable,
    // scroll-snapped strip. As the user swipes, we read scrollLeft on every
    // frame (rAF-throttled) and drive a stacked-card transform per card:
    // the incoming card slides up from below and settles on top, the outgoing
    // card stays put underneath, scaling/dimming slightly as it's covered.
    // =========================================================================
    mm.add("(max-width: 767.98px)", () => {
      const mobileTrack = mobileTrackRef.current;
      const cards = mobileCardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
      const dots = dotRefs.current.filter((el): el is HTMLSpanElement => Boolean(el));
      if (!mobileTrack || cards.length === 0) return;

      // Cards are position:absolute, so they contribute no height to the stage.
      // Descriptions vary in length, so cards vary in height — sizing the stage to
      // a single card cropped the taller ones. Measure every card's real layout
      // height (offsetHeight ignores our scale/translate transforms) and pin the
      // stage to the tallest so no card is ever clipped. Re-run on resize/rotate.
      const stage = mobileStageRef.current;
      const sizeStage = () => {
        if (!stage) return;
        const maxH = Math.max(...cards.map((card) => card.offsetHeight));
        if (maxH > 0) stage.style.minHeight = `${maxH}px`;
      };
      sizeStage();
      window.addEventListener("resize", sizeStage);

      // quickTo setters: each call nudges the tween's target rather than
      // snapping to it, so fast/rapid scroll updates blend into one smooth,
      // eased motion instead of jumping frame-to-frame (kills jitter).
      const EASE = "power3.out";
      // Bundle each card/dot with its own quickTo setters so the update loop can
      // iterate the objects directly instead of indexing parallel arrays — this
      // also keeps things clean under noUncheckedIndexedAccess.
      const cardCtx = cards.map((card) => ({
        card,
        setX: gsap.quickTo(card, "x", { duration: 0.55, ease: EASE }),
        setScale: gsap.quickTo(card, "scale", { duration: 0.55, ease: EASE }),
        setOpacity: gsap.quickTo(card, "opacity", { duration: 0.4, ease: EASE }),
      }));
      const dotCtx = dots.map((dot) => ({
        dot,
        setScale: gsap.quickTo(dot, "scale", { duration: 0.35, ease: EASE }),
        setOpacity: gsap.quickTo(dot, "opacity", { duration: 0.35, ease: EASE }),
      }));

      let ticking = false;

      const update = () => {
        ticking = false;
        const scrollLeft = mobileTrack.scrollLeft;
        const slotWidth = mobileTrack.clientWidth; // one snap slot == viewport width

        cardCtx.forEach(({ card, setX, setScale, setOpacity }, i) => {
          // raw < 0  -> card hasn't arrived yet (waiting underneath, off to the right)
          // raw = 0  -> card is the active card, fully settled on top
          // raw > 0  -> card has been swiped past, now resting underneath, shifted left
          const raw = scrollLeft / slotWidth - i;

          if (raw <= 0) {
            // 0 = fully hidden off to the right, 1 = fully arrived on top
            const arrive = gsap.utils.clamp(0, 1, 1 + raw);
            setX(110 * (1 - arrive)); // slides in from the RIGHT to 0
            setScale(0.9 + arrive * 0.1);
            setOpacity(arrive);
          } else {
            // card already active/passed: stays put, just eases slightly
            // LEFT and recedes as the next card lands on top of it
            const past = gsap.utils.clamp(0, 1, raw);
            setX(-past * 26);
            setScale(1 - past * 0.06);
            setOpacity(1 - past * 0.3);
          }
          card.style.zIndex = String(100 + i);
        });

        // active-dot indicator
        const activeIndex = Math.round(scrollLeft / slotWidth);
        dotCtx.forEach(({ setScale, setOpacity }, i) => {
          setScale(i === activeIndex ? 1.4 : 1);
          setOpacity(i === activeIndex ? 1 : 0.35);
        });
      };

      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      };

      // Set initial state instantly (no ease) so the first paint is correct.
      gsap.set(cards, { x: 0, scale: 1, opacity: 1 });
      cards.forEach((card, i) => {
        if (i > 0) gsap.set(card, { x: 110, scale: 0.9, opacity: 0 });
        card.style.zIndex = String(100 + i);
      });
      update();

      mobileTrack.addEventListener("scroll", onScroll, { passive: true });

      return () => {
        cardCtx.forEach(({ card }) => gsap.killTweensOf(card));
        dotCtx.forEach(({ dot }) => gsap.killTweensOf(dot));
        mobileTrack.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", sizeStage);
      };
    });

    return () => mm.revert();
  }, []);

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
      {/* MOBILE — vertical page scroll; horizontal swipe drives a true      */}
      {/* card-on-card stack (all cards share the same position, layered).  */}
      {/* ---------------------------------------------------------------- */}
      <div className="h-screen md:hidden">
        <div ref={mobileStageRef} className="relative" style={{ perspective: "1200px" }}>
          {/* Invisible spacer: renders the first card in normal flow purely to
              give this relative container a sensible natural height before JS
              runs (the real cards below are position:absolute, i.e. zero height).
              Once mounted, the effect measures the tallest card and pins the
              stage's min-height to it so no card is ever cropped. */}
          {features[0] && (
            <div className="invisible px-[8vw]" aria-hidden="true">
              <FeatureCard
                icon={features[0].icon}
                title={t(features[0].titleKey)}
                description={t(features[0].descriptionKey)}
                gradient={features[0].gradient}
                index={0}
                illustration={features[0].illustration}
              />
            </div>
          )}

          {/* Visual stack — every card is layered at the exact same spot.
              Position/scale/opacity per card is driven entirely by JS
              (see the GSAP mm.add mobile block above) based on swipe progress. */}
          {features.map((f, i) => (
            <div
              key={f.titleKey}
              ref={(el) => {
                mobileCardRefs.current[i] = el;
              }}
              className="absolute inset-x-0 top-0 my-10 flex justify-center px-[8vw] will-change-transform"
              style={{ transformOrigin: "center center" }}
            >
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

          {/* Invisible swipe-capture layer, sits on top of the whole stack.
              Fully transparent but still scrollable/touchable — this is what
              actually receives the user's horizontal swipe gesture; the
              cards underneath are purely visual and driven by its scroll
              position via the effect above. */}
          <div
            ref={mobileTrackRef}
            className="absolute inset-0 z-[999] flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto opacity-0 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
            aria-hidden="true"
          >
            {features.map((f) => (
              <div key={f.titleKey} className="w-full shrink-0 snap-center" />
            ))}
          </div>
        </div>

        {/* Dot indicators — highlight the active card as the user swipes */}
        <div className="mt-6 flex justify-center gap-2">
          {features.map((f, i) => (
            <span
              key={f.titleKey}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="bg-ink/40 h-1.5 w-1.5 rounded-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
