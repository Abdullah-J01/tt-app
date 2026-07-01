"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Wifi, Signal, BatteryFull } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedFeed from "./AnimatedFeed";

gsap.registerPlugin(ScrollTrigger);

export default function PhoneMockup() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || !wrapRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(wrapRef.current, {
        y: -80,
        rotate: -3,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top center",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="relative flex justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.75, rotate: 8, y: 60 }}
        animate={{ opacity: 1, scale: 1, rotate: -4, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 90,
          damping: 13,
          delay: 0.3,
        }}
        className="relative"
      >
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-[260px] sm:w-[300px] h-[540px] sm:h-[620px] rounded-[2.75rem] bg-ink p-3 shadow-glow"
        >
          {/* screen */}
          <div className="relative w-full h-full rounded-[2.1rem] overflow-hidden bg-plum-start">
            {/* status bar */}
            <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 pt-3 text-white text-[11px] font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <Signal size={12} />
                <Wifi size={12} />
                <BatteryFull size={14} />
              </div>
            </div>
            {/* notch */}
            <div className="absolute top-0 inset-x-0 z-30 flex justify-center pt-1.5">
              <div className="w-24 h-5 rounded-full bg-ink" />
            </div>

            <div className="absolute inset-0 pt-9">
              <AnimatedFeed />
            </div>
          </div>
        </motion.div>

        {/* side buttons */}
        <div className="absolute -left-[3px] top-28 w-1 h-8 rounded-l bg-ink/80" />
        <div className="absolute -left-[3px] top-40 w-1 h-12 rounded-l bg-ink/80" />
        <div className="absolute -right-[3px] top-32 w-1 h-16 rounded-r bg-ink/80" />
      </motion.div>
    </div>
  );
}
