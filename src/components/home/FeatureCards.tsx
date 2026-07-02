"use client";

import { useEffect, useRef } from "react";
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

// Gradients + colors are the globals.css design tokens
// (bg-*-gradient utilities built from --color-violet / -green / -plum / -amber).
const features = [
  {
    icon: Zap,
    title: "Bite sized cards",
    description: "Five second insights you actually remember.",
    gradient: "bg-violet-gradient",
    illustration: <FloatingShard />,
  },
  {
    icon: BookOpen,
    title: "Thousands of studybooks",
    description: "A whole catalog, reimagined as cards.",
    gradient: "bg-green-gradient",
    illustration: <FloatingBook />,
  },
  {
    icon: Smartphone,
    title: "Learn on any device",
    description: "Phone, tablet, web your streak follows.",
    gradient: "bg-plum-gradient",
    illustration: <FloatingDevices />,
  },
  {
    icon: Users,
    title: "Learn together",
    description: "Share decks and race your friends.",
    gradient: "bg-violet-gradient",
    illustration: <FloatingStack />,
  },
  {
    icon: Trophy,
    title: "Earn as you go",
    description: "Badges and levels for every win.",
    gradient: "bg-green-gradient",
    illustration: <FloatingPrism />,
  },
  {
    icon: Flame,
    title: "Keep your streak",
    description: "Daily nudges that make learning stick.",
    gradient: "bg-plum-gradient",
    illustration: <FloatingRings />,
  },
];

export default function FeatureCards() {
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

      const tween = gsap.to(track, {
        x: () => -getScrollAmount(), // translate the container along the X-axis
        ease: "none", // linear -> vertical scroll maps 1:1 to horizontal move
        scrollTrigger: {
          trigger: section,
          start: "top top", // pin the moment the section reaches the top
          end: () => `+=${getScrollAmount()}`, // scroll length == horizontal travel
          pin: true, // hold the section fixed while the row scrolls sideways
          scrub: 1, // smoothly follow the scrollbar (scrubbed)
          anticipatePin: 1, // avoid a 1-frame jump as pinning engages
          invalidateOnRefresh: true, // recompute widths on resize
        },
      });

      // Recalculate once the async 3D scenes have mounted and laid out.
      ScrollTrigger.refresh();

      return () => {
        tween.kill();
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
          <div key={f.title} className="w-fit shrink-0">
            <FeatureCard
              icon={f.icon}
              title={f.title}
              description={f.description}
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
