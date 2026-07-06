"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { SUBJECTS } from "@/config/subjects";
import { cn } from "@/lib/utils";

/* Direction offsets — where each card flies in from ------------------ */
type Dir =
  "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

const DIRECTIONS: Dir[] = [
  "left",
  "top",
  "right",
  "bottom",
  "top-right",
  "bottom-left",
  "top-left",
  "bottom-right",
];

function offsetFor(dir: Dir): { x: number; y: number; rotate: number } {
  switch (dir) {
    case "left":
      return { x: -90, y: 0, rotate: -6 };
    case "right":
      return { x: 90, y: 0, rotate: 6 };
    case "top":
      return { x: 0, y: -70, rotate: -4 };
    case "bottom":
      return { x: 0, y: 70, rotate: 4 };
    case "top-left":
      return { x: -70, y: -55, rotate: -8 };
    case "top-right":
      return { x: 70, y: -55, rotate: 8 };
    case "bottom-left":
      return { x: -70, y: 55, rotate: -8 };
    case "bottom-right":
      return { x: 70, y: 55, rotate: 8 };
  }
}

/** Smooth scalloped ("wavy") circle path — the egg-white ring around the yolk. */
function wavyRingPath(bumps = 12, rBase = 82, rBump = 9, size = 200) {
  const c = size / 2;
  const steps = bumps * 2;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = rBase + (i % 2 === 0 ? rBump : -rBump);
    pts.push([c + Math.cos(a) * r, c + Math.sin(a) * r]);
  }
  const mid = (p: [number, number], q: [number, number]): [number, number] => [
    (p[0] + q[0]) / 2,
    (p[1] + q[1]) / 2,
  ];
  const n = pts.length;
  let d = `M ${mid(pts[n - 1]!, pts[0]!).join(" ")} `;
  for (let i = 0; i < n; i++) {
    const cur = pts[i]!;
    const m = mid(cur, pts[(i + 1) % n]!);
    d += `Q ${cur[0]} ${cur[1]} ${m[0]} ${m[1]} `;
  }
  return `${d}Z`;
}

const WAVY_RING = wavyRingPath(8, 88, 5);

type SubjectCardData = { subject: (typeof SUBJECTS)[number]; dir: Dir };

/**
 * "Explore by subject" — a scroll-controlled reveal (Framer Motion, no GSAP).
 * A tall section on a `sticky` panel: as YOU scroll, the centre circle + heading
 * hold, then zoom through and fade, then the subject cards fly in from every
 * direction. Everything is tied to scroll progress (nothing autoplays). When the
 * section ends the sticky releases straight into the next section (no blank).
 * Reduced-motion → a plain static grid.
 */
export function SubjectReveal() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Scroll progress through the section (0 = its top hits the viewport top, 1 =
  // its bottom hits the viewport bottom), measured from getBoundingClientRect so
  // it tracks the real viewport position on every scroll — robust with Lenis and
  // whichever element is the actual scroller (unlike Framer's useScroll here).
  const scrollYProgress = useMotionValue(0);
  useEffect(() => {
    if (reduced) return;
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const p = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0;
      scrollYProgress.set(p);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced, scrollYProgress]);

  const cards = useMemo<SubjectCardData[]>(
    () => SUBJECTS.map((subject, i) => ({ subject, dir: DIRECTIONS[i % DIRECTIONS.length] ?? "left" })),
    [],
  );

  // Phase 1a (0 → 0.18): centre holds, as-is. 1b (0.18 → 0.4): zoom + fade out —
  // it's fully gone by 0.4, with a clear gap before the cards so the two never
  // show at once (no stacked/overlapping frame).
  const centreScale = useTransform(scrollYProgress, [0, 0.18, 0.42], [1, 1, 2.8]);
  const centreOpacity = useTransform(scrollYProgress, [0, 0.18, 0.4], [1, 1, 0]);
  const rippleScale = useTransform(scrollYProgress, [0.18, 0.42], [1, 4.2]);
  const rippleOpacity = useTransform(scrollYProgress, [0.18, 0.3, 0.42], [0, 0.4, 0]);
  // Phase 2 (0.46 →): only once the centre is gone does the grid fade in.
  const gridOpacity = useTransform(scrollYProgress, [0.46, 0.54], [0, 1]);

  return (
    <section ref={sectionRef} className={reduced ? "relative" : "relative h-[320vh]"}>
      <div
        className={cn(
          "flex w-full items-start justify-center overflow-hidden bg-white",
          reduced ? "relative min-h-screen py-16" : "sticky top-0 h-screen",
        )}
      >
        {/* Centre: circle + rings + heading — scroll zooms it through and fades. */}
        {!reduced && (
          <motion.div
            style={{ scale: centreScale, opacity: centreOpacity }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          >
            {/* echo ripples */}
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                aria-hidden
                style={{ scale: rippleScale, opacity: rippleOpacity }}
                className="bg-plum-gradient pointer-events-none absolute inset-0 z-[14] m-auto h-64 w-64 rounded-full md:h-72 md:w-72"
              />
            ))}
            {/* rings + glow */}
            <div className="absolute inset-0">
              <div
                aria-hidden
                className="absolute inset-0 m-auto h-[24rem] w-[24rem] rounded-full blur-[70px] sm:h-[34rem] sm:w-[34rem] sm:blur-[90px] md:h-[42rem] md:w-[42rem]"
                style={{
                  background:
                    "radial-gradient(circle, rgba(108,76,227,0.34) 0%, rgba(108,76,227,0.12) 42%, transparent 70%)",
                }}
              />
              <motion.svg
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 48, ease: "linear" }}
                viewBox="0 0 200 200"
                aria-hidden
                className="absolute inset-0 m-auto h-[21rem] w-[21rem] sm:h-[33rem] sm:w-[33rem] md:h-[46rem] md:w-[46rem]"
              >
                <defs>
                  <linearGradient id="subjectDashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6c4ce3" />
                    <stop offset="100%" stopColor="#9c85f0" />
                  </linearGradient>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r="98"
                  fill="none"
                  stroke="url(#subjectDashGrad)"
                  strokeOpacity={0.45}
                  strokeWidth={0.5}
                  strokeDasharray="1.5 3"
                />
              </motion.svg>
              <motion.svg
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 65, ease: "linear" }}
                viewBox="0 0 200 200"
                aria-hidden
                className="absolute inset-0 m-auto h-[18rem] w-[18rem] sm:h-[28rem] sm:w-[28rem] md:h-[38rem] md:w-[38rem]"
              >
                <defs>
                  <radialGradient id="subjectBlobFill" cx="50%" cy="42%" r="62%">
                    <stop offset="0%" stopColor="rgba(108,76,227,0.12)" />
                    <stop offset="65%" stopColor="rgba(108,76,227,0.04)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </radialGradient>
                </defs>
                <path
                  d={WAVY_RING}
                  fill="url(#subjectBlobFill)"
                  stroke="#6c4ce3"
                  strokeOpacity={0.4}
                  strokeWidth={1}
                  strokeLinejoin="round"
                />
              </motion.svg>
              <div
                aria-hidden
                className="absolute inset-0 m-auto h-[21rem] w-[21rem] sm:h-[33rem] sm:w-[33rem] md:h-[46rem] md:w-[46rem]"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
                  className="relative h-full w-full"
                >
                  <span className="bg-violet absolute top-0 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_16px_rgba(108,76,227,0.6)]" />
                </motion.div>
              </div>
            </div>
            {/* heading */}
            <div className="relative px-6 text-center">
              <h2 className="font-display leading-[0.82] font-extrabold tracking-tight uppercase">
                <span className="text-ink block text-4xl sm:text-6xl md:text-8xl">Learn</span>
                <span className="text-violet/25 -mt-1 block text-4xl sm:-mt-3 sm:text-6xl md:-mt-4 md:text-8xl">
                  Something New
                </span>
              </h2>
              <p className="text-muted mt-6 text-xs font-semibold tracking-[0.35em] uppercase sm:text-sm">
                In the time it takes to scroll.
              </p>
            </div>
          </motion.div>
        )}

        {/* Subject grid — scroll flies the cards in after the centre has gone. */}
        <motion.div
          style={reduced ? undefined : { opacity: gridOpacity }}
          className="relative z-10 mx-auto grid max-w-6xl grid-cols-2 items-center gap-2.5 px-5 pt-24 pb-16 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:pt-28 lg:grid-cols-5 lg:gap-4"
        >
          {cards.map((card, i) => (
            <SubjectCard
              key={card.subject.slug}
              progress={scrollYProgress}
              card={card}
              index={i}
              total={cards.length}
              reduced={!!reduced}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/** One subject card — scroll flies it in from its direction over its own slice. */
function SubjectCard({
  progress,
  card,
  index,
  total,
  reduced,
}: {
  progress: MotionValue<number>;
  card: SubjectCardData;
  index: number;
  total: number;
  reduced: boolean;
}) {
  const off = offsetFor(card.dir);
  // Cards arrive only after the centre is fully gone (>0.5), staggered by index.
  const start = 0.52 + (index / Math.max(total, 1)) * 0.38;
  const end = Math.min(start + 0.13, 0.99);
  const x = useTransform(progress, [start, end], [off.x, 0]);
  const y = useTransform(progress, [start, end], [off.y, 0]);
  const scale = useTransform(progress, [start, end], [0.5, 1]);
  const rotate = useTransform(progress, [start, end], [off.rotate, 0]);
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const Icon = card.subject.icon;

  return (
    <motion.div
      style={reduced ? undefined : { x, y, scale, rotate, opacity }}
      className="will-change-transform"
    >
      <Link href={`/explore/${card.subject.slug}`} className="block">
        <motion.div
          whileHover={{ y: -4, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="border-ink/10 flex flex-col items-center gap-1.5 rounded-2xl border bg-white/80 p-3 text-center shadow-sm backdrop-blur-sm"
        >
          <Icon className={cn("h-6 w-6", card.subject.color)} strokeWidth={1.75} />
          <span className="text-ink text-sm font-medium">{card.subject.name}</span>
          <span className="text-ink/45 text-xs">{card.subject.count.toLocaleString()} items</span>
        </motion.div>
      </Link>
    </motion.div>
  );
}
