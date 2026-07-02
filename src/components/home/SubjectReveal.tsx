"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SUBJECTS } from "@/config/subjects";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* Direction offsets — where each card flies in from ------------------ */
type Dir =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

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
      return { x: -70, y: 0, rotate: -6 };
    case "right":
      return { x: 70, y: 0, rotate: 6 };
    case "top":
      return { x: 0, y: -55, rotate: -4 };
    case "bottom":
      return { x: 0, y: 55, rotate: 4 };
    case "top-left":
      return { x: -55, y: -45, rotate: -8 };
    case "top-right":
      return { x: 55, y: -45, rotate: 8 };
    case "bottom-left":
      return { x: -55, y: 45, rotate: -8 };
    case "bottom-right":
      return { x: 55, y: 45, rotate: 8 };
  }
}

const FIRST_WAVE_COUNT = 4;

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

/**
 * "Explore by subject" as a pinned scroll reveal. The heading sits in the centre
 * (like a tunnel entry point); scrolling zooms through it, then the subject cards
 * fly in from every direction in waves. Under reduced-motion → static grid.
 */
export function SubjectReveal() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const eggRef = useRef<SVGSVGElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const dashRef = useRef<SVGSVGElement | null>(null);
  const orbitSpinRef = useRef<HTMLDivElement | null>(null);
  const decorRef = useRef<HTMLDivElement | null>(null);
  const rippleRefs = useRef<Array<HTMLDivElement | null>>([]);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const paragraphRef = useRef<HTMLDivElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);

  const [scrollVh, setScrollVh] = useState(600);

  const cards = useMemo(
    () =>
      SUBJECTS.map((subject, i) => ({
        subject,
        dir: DIRECTIONS[i % DIRECTIONS.length] ?? "left",
        depth: 0.6 + ((i * 37) % 40) / 100, // deterministic pseudo-parallax depth 0.6–1.0
      })),
    [],
  );

  useLayoutEffect(() => {
    const vh = Math.min(750, Math.max(420, 320 + SUBJECTS.length * 14));
    setScrollVh(vh);
  }, []);

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      gsap.set(cardRefs.current.filter(Boolean), { x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 });
      gsap.set(gridRef.current, { opacity: 1 });
      gsap.set(headingRef.current, { opacity: 1 });
      return;
    }

    // Always-on spins — the rings and orbiting dot keep moving.
    const spins = [
      gsap.to(dashRef.current, { rotation: 360, duration: 48, ease: "none", repeat: -1 }),
      gsap.to(eggRef.current, { rotation: -360, duration: 65, ease: "none", repeat: -1 }),
      gsap.to(orbitSpinRef.current, { rotation: 360, duration: 16, ease: "none", repeat: -1 }),
    ];

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => buildTimeline(1));
    mm.add("(max-width: 767px)", () => buildTimeline(0.55));

    function buildTimeline(intensity: number) {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: wrapperRef.current,
          pin: pinRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Phase 0: hold on the heading briefly.
      tl.to({}, { duration: 0.4 });

      // Phase 1: zoom-through tunnel — the whole centre (glow, rings, dot, circle)
      // scales up and fades out together.
      tl.to(
        decorRef.current,
        { scale: 7, opacity: 0, filter: "blur(4px)", duration: 1.1, ease: "power2.in" },
        ">",
      );
      // Echo circles emerge from behind (50% opacity) and grow with the zoom.
      tl.fromTo(
        rippleRefs.current.filter(Boolean),
        { scale: 1, opacity: 0.5 },
        {
          scale: (i: number) => 4 + i * 3,
          opacity: 0,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.12,
          immediateRender: false,
        },
        "<",
      );
      // Background stays put — tiny breathing scale only.
      tl.fromTo(
        bgRef.current,
        { scale: 1 },
        { scale: 1.04, duration: 1.8, ease: "sine.inOut" },
        "<",
      );

      // Phase 2: grid appears, cards fly in.
      tl.fromTo(gridRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "<0.3");

      const cardEls = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      const firstWave = cardEls.slice(0, FIRST_WAVE_COUNT);
      const restWave = cardEls.slice(FIRST_WAVE_COUNT);

      // First few cards arrive together, fast & punchy.
      firstWave.forEach((el, i) => {
        const card = cards[i];
        if (!card) return;
        const off = offsetFor(card.dir);
        tl.fromTo(
          el,
          {
            x: off.x * intensity,
            y: off.y * intensity,
            rotate: off.rotate,
            scale: 0.5,
            opacity: 0,
            filter: "blur(6px)",
          },
          {
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.6,
            ease: "back.out(1.4)",
          },
          i === 0 ? "-=0.15" : "<0.08",
        );
      });

      // Remaining cards trickle in, staggered by depth.
      restWave.forEach((el, i) => {
        const card = cards[i + FIRST_WAVE_COUNT];
        if (!card) return;
        const off = offsetFor(card.dir);
        tl.fromTo(
          el,
          {
            x: off.x * intensity,
            y: off.y * intensity,
            rotate: off.rotate,
            scale: 0.6,
            opacity: 0,
            filter: "blur(5px)",
          },
          {
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.55 * card.depth + 0.35,
            ease: "power3.out",
          },
          "<0.09",
        );
      });

      // Subtle parallax settle on the whole grid after the reveal.
      tl.to(gridRef.current, { y: -10, duration: 0.4, ease: "sine.inOut" }, "<0.2");

      // Phase 3: recede the grid, bring in the closing line.
      tl.to(
        gridRef.current,
        { scale: 0.92, opacity: 0.18, filter: "blur(3px)", duration: 0.6, ease: "power2.inOut" },
        "+=0.2",
      );
      tl.fromTo(eyebrowRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35 }, "<0.1");
      tl.fromTo(
        paragraphRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
        "<0.05",
      );

      // Brief hold so the ending doesn't feel abrupt before unpin.
      tl.to({}, { duration: 0.35 });
    }

    return () => {
      spins.forEach((s) => s.kill());
      mm.revert();
    };
  }, [cards, scrollVh]);

  return (
    <div ref={wrapperRef} className="relative" style={{ height: `${scrollVh}vh` }}>
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden bg-white">
        {/* Stable background — never translates during the sequence */}
        <div
          ref={bgRef}
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,#f7f5f0_0%,#ffffff_65%)]"
        />

        {/* Echo circles — hidden until the zoom (immediateRender:false) */}
        {[0, 1].map((i) => (
          <div
            key={i}
            ref={(el) => {
              rippleRefs.current[i] = el;
            }}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[14] m-auto h-64 w-64 rounded-full bg-plum-gradient opacity-0 md:h-72 md:w-72"
          />
        ))}

        {/* Center decoration + heading — scales/fades together on zoom; rings spin */}
        <div ref={decorRef} className="pointer-events-none absolute inset-0 z-20">
          {/* soft radial glow */}
          <div
            ref={glowRef}
            aria-hidden
            className="absolute inset-0 m-auto h-[42rem] w-[42rem] rounded-full blur-[90px]"
            style={{
              background:
                "radial-gradient(circle, rgba(108,76,227,0.34) 0%, rgba(108,76,227,0.12) 42%, transparent 70%)",
            }}
          />
          {/* dashed rotating ring — gradient stroke */}
          <svg
            ref={dashRef}
            viewBox="0 0 200 200"
            aria-hidden
            className="absolute inset-0 m-auto h-[46rem] w-[46rem]"
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
          </svg>
          {/* wavy rotating blob (filled + outline) */}
          <svg
            ref={eggRef}
            viewBox="0 0 200 200"
            aria-hidden
            className="absolute inset-0 m-auto h-[38rem] w-[38rem]"
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
          </svg>
          {/* orbiting dot riding the dashed ring */}
          <div aria-hidden className="absolute inset-0 m-auto h-[46rem] w-[46rem]">
            <div ref={orbitSpinRef} className="relative h-full w-full">
              <span className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet shadow-[0_0_16px_rgba(108,76,227,0.6)]" />
            </div>
          </div>
          {/* layered heading over the glow (hero style — no solid circle) */}
          <div
            ref={headingRef}
            className="absolute inset-0 flex items-center justify-center px-6 text-center"
          >
            <div>
              <h2 className="font-display font-extrabold uppercase leading-[0.82] tracking-tight">
                <span className="block text-5xl text-ink sm:text-7xl md:text-8xl">Learn</span>
                <span className="-mt-2 block text-5xl text-violet/25 sm:-mt-4 sm:text-7xl md:text-8xl">
                  Something New
                </span>
              </h2>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-muted sm:text-sm">
                In the time it takes to scroll.
              </p>
            </div>
          </div>
        </div>

        {/* Subject grid */}
        <div
          ref={gridRef}
          className="relative z-10 mx-auto grid h-full max-w-6xl grid-cols-2 content-center items-center gap-3 px-5 pt-28 pb-12 opacity-0 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:pt-32 lg:grid-cols-5 lg:gap-5"
        >
          {cards.map(({ subject }, i) => {
            const Icon = subject.icon;
            return (
              <div
                key={subject.slug}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="will-change-transform"
                style={{ opacity: 0 }}
              >
                <Link href={`/explore/${subject.slug}`} className="block">
                  <motion.div
                    whileHover={{ y: -4, scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-ink/10 bg-white/80 p-4 text-center shadow-sm backdrop-blur-sm"
                  >
                    <Icon className={cn("h-6 w-6", subject.color)} strokeWidth={1.75} />
                    <span className="text-sm font-medium text-ink">{subject.name}</span>
                    <span className="text-xs text-ink/45">
                      {subject.count.toLocaleString()} items
                    </span>
                  </motion.div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Closing line — revealed once every card has landed */}
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6">
          <div className="max-w-xl text-center">
            <p
              ref={eyebrowRef}
              className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink/40 opacity-0"
            >
              Every subject, one place
            </p>
            <div ref={paragraphRef} className="opacity-0">
              <p className="text-2xl font-medium leading-snug text-ink md:text-3xl">
                From history to chemistry, from Estonian to Russian — thousands of study materials
                are organized into subjects you already know.
              </p>
              <Link
                href="/explore"
                className="pointer-events-auto mt-6 inline-flex items-center gap-1 rounded-full border border-ink/15 px-5 py-2 text-sm font-medium text-ink transition-colors hover:border-violet hover:text-violet"
              >
                All subjects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
