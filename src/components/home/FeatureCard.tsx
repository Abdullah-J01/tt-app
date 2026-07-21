"use client";

import { ReactNode, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, type MotionProps } from "framer-motion";
import dynamic from "next/dynamic";
import { LucideIcon } from "lucide-react";

const Scene = dynamic(() => import("../three/Scene"), { ssr: false });

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  index: number;
  illustration: ReactNode;
  /** Staggered fade-up on first scroll into view. Off for the mobile swipe
   *  stack, where cards arrive under the finger and any entrance delay
   *  just holds back the card the user is already dragging in. */
  animateIn?: boolean;
  /** Whether this card's 3D scene runs a live render loop. Buried cards in
   *  the mobile stack pass false so they freeze on a single static frame. */
  live?: boolean;
};

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  index,
  illustration,
  animateIn = true,
  live = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 10);
    rotateX.set(-py * 10);
  }

  function handleMouseLeave() {
    setHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }

  const entrance: MotionProps = animateIn
    ? {
        initial: { opacity: 0, y: 40, scale: 0.96 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] },
      }
    : { initial: false };

  return (
    <motion.div
      ref={ref}
      {...entrance}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformPerspective: 800,
      }}
      // lg width solves 4-up: 4w + 3×24px gaps + 2×6vw track padding = 100vw.
      className={`rounded-xl3 relative w-[82vw] overflow-hidden p-6 sm:w-[46vw] sm:p-7 lg:w-[calc(22vw-18px)] ${gradient} shadow-soft transition-shadow duration-500 ${
        hovered ? "shadow-lift" : ""
      }`}
    >
      {/* glow border on hover */}
      <div
        className={`rounded-xl3 pointer-events-none absolute inset-0 ring-1 transition-all duration-500 ring-inset ${
          hovered ? "ring-white/40" : "ring-white/10"
        }`}
      />

      <div className="relative z-10 mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
        <Icon size={16} className="text-white" />
      </div>

      <h3 className="font-display text-h3 relative z-10 mb-1.5 text-white">{title}</h3>
      <p className="text-caption relative z-10 max-w-[80%] text-white/70 sm:text-sm">
        {description}
      </p>

      {/* 3D illustration viewport */}
      <div className="relative z-10 mt-6 h-44 overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm sm:h-48">
        <Scene frameloop={live ? "always" : "demand"}>{illustration}</Scene>
      </div>

      {/* <button className="relative z-10 mt-6 w-full rounded-full bg-white/15 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/25">
        Preview
      </button> */}
    </motion.div>
  );
}
