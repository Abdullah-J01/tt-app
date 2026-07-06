"use client";

import dynamic from "next/dynamic";
import { HeroSkeleton } from "@/components/skeletons";

/**
 * Client-only Hero (framer-motion staggers + GSAP scroll parallax render
 * hidden until hydration anyway). The skeleton mirrors the hero's exact
 * dimensions, so the swap is shift-free and every entrance animation still
 * fires on mount.
 */
const Hero = dynamic(() => import("./Hero"), {
  ssr: false,
  loading: () => <HeroSkeleton />,
});

export default function HeroLoader() {
  return <Hero />;
}
