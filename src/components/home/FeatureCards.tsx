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
  const sectionRef = useRef<HTMLElement>(null); // pinned to the viewport
  const trackRef = useRef<HTMLDivElement>(null); // the wide row we slide on X

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // gsap.matchMedia scopes everything created inside each query and auto-reverts
    // on unmount / when the query stops matching (also re-runs on resize).
    const mm = gsap.matchMedia();

    // Only scroll-jack when motion is welcome. prefers-reduced-motion users keep
    // the section's native left/right scroll (overflow-x-auto) with no pinning.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Native horizontal scroll would fight the pin, so disable it while active.
      section.style.overflowX = "hidden";

      // How far the row overflows the viewport = how far it must travel on X.
      // A function so it's re-measured on every ScrollTrigger.refresh() (resize).
      const getScrollAmount = () => Math.max(0, track.scrollWidth - window.innerWidth);
      // Fraction of the travel distance added as a tail where the row HOLDS after
      // the last card lands — so the last feature card is fully visible and the
      // section settles before it unpins and the next (ExploreSection) begins.
      // This is the clean handoff: the pin fully finishes here, then plain
      // vertical scroll moves into the reveal — no overlap.
      const HOLD_RATIO = 0.25;

      // Timeline: the track tween (duration 1) is the horizontal travel; the empty
      // tween (duration HOLD_RATIO) is the settle. Numeric durations keep the
      // scrub mapping exact, and `end` uses the same ratio so travel completes
      // precisely when the last card is fully in view, then holds for the tail.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top", // pin the moment the section reaches the top
          end: () => `+=${getScrollAmount() * (1 + HOLD_RATIO)}`, // travel + settle
          pin: true, // hold the section fixed while the row scrolls sideways
          scrub: 1, // smoothly follow the scrollbar (scrubbed)
          anticipatePin: 1, // avoid a 1-frame jump as pinning engages
          invalidateOnRefresh: true, // recompute widths on resize
        },
      });
      tl.to(track, {
        x: () => -getScrollAmount(), // translate the container along the X-axis
        ease: "none", // linear -> vertical scroll maps 1:1 to horizontal move
        duration: 1,
      });
      tl.to({}, { duration: HOLD_RATIO }); // settle on the last card, then unpin

      // Recalculate once the async 3D scenes have mounted and laid out.
      ScrollTrigger.refresh();

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        section.style.overflowX = "";
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      // h-screen + centered so the row sits mid-viewport while pinned.
      // overflow-x-auto is the reduced-motion / no-JS fallback (native swipe).
      className="relative flex h-screen items-center overflow-x-auto"
    >
      <div
        ref={trackRef}
        // w-max keeps the row at its natural (overflowing) width so it can slide.
        className="flex w-max gap-5 px-[6vw] will-change-transform sm:gap-6"
      >
        {features.map((f, i) => (
          // Fixed-ish, responsive widths so the row overflows on every screen size.
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
    </section>
  );
}
