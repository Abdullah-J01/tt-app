"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { SUBJECTS, type Subject } from "@/config/subjects";

/**
 * "Explore by subject" as a scroll-spun 3D coverflow. Cards fan around a
 * vertical axis; scroll drives a floating `focus` index and each card rides the
 * ring relative to it, so one card sweeps up to the flat, front-centred focus
 * while its neighbours tilt away and fade. The stage pins while you scroll a
 * tall track; once the last card passes the centre, the page scrolls on.
 * Under reduced-motion it falls back to the original grid.
 */

/** Scroll distance (vh) to advance the coverflow by one card. */
const PER_CARD_VH = 14;
/** Vertical anchor of the deck inside the pinned stage. */
const ANCHOR = "48%";

// --- Coverflow geometry (all tunable) ----------------------------------------
const ANGLE = 30; // deg of revolution between adjacent cards
const DEPTH = 150; // px — how far the ring bows back
const ROTY = 0.35; // 0 = faces flat, 1 = fully tangent (coverflow tilt)
const SCALE_STEP = 0.22; // how much smaller each card gets away from centre
const OPACITY_STEP = 0.32;

/**
 * Shortest signed distance on a ring of `n` cards — keeps neighbours fanned on
 * BOTH sides of the centre (wrapping around) at every scroll position, so the
 * centre card is never left with an empty side.
 */
function ringDelta(d: number, n: number) {
  let m = ((d % n) + n) % n;
  if (m > n / 2) m -= n;
  return m;
}

interface Dims {
  cardW: number;
  cardH: number;
  /** Horizontal radius of the ring — smaller = more overlap. */
  spreadX: number;
}

function FlowCard({
  subject,
  index,
  count,
  focus,
  dims,
}: {
  subject: Subject;
  index: number;
  count: number;
  focus: MotionValue<number>;
  dims: Dims;
}) {
  const { cardW, cardH, spreadX } = dims;
  const Icon = subject.icon;

  const transform = useTransform(focus, (f) => {
    const d = ringDelta(index - f, count); // signed ring distance: 0 = centred
    const rad = (d * ANGLE * Math.PI) / 180;
    const x = Math.sin(rad) * spreadX; // fan out sideways
    const z = (Math.cos(rad) - 1) * DEPTH; // bow away from the viewer
    const roty = -d * ANGLE * ROTY; // face tangent to the ring
    const scale = Math.max(0.4, 1 - Math.abs(d) * SCALE_STEP);
    return `translate3d(${x}px, 0px, ${z}px) rotateY(${roty}deg) scale(${scale})`;
  });
  const opacity = useTransform(focus, (f) =>
    Math.max(0, 1 - Math.abs(ringDelta(index - f, count)) * OPACITY_STEP),
  );
  const zIndex = useTransform(focus, (f) =>
    Math.round(100 - Math.abs(ringDelta(index - f, count)) * 10),
  );
  // Every visible card in the fan is clickable (opens its subject); z-index
  // resolves overlaps so the front-most card under the cursor wins the click.
  // Far/faded cards opt out so they don't swallow taps.
  const pointerEvents = useTransform(focus, (f) =>
    Math.abs(ringDelta(index - f, count)) < 3 ? "auto" : "none",
  );
  // Border + ring fade to violet as the card reaches the centre.
  const borderColor = useTransform(
    focus,
    [index - 0.5, index, index + 0.5],
    ["rgb(228,228,231)", "rgb(108,76,227)", "rgb(228,228,231)"],
  );
  const ringOpacity = useTransform(focus, (f) => Math.max(0, 1 - Math.abs(index - f) * 2));

  return (
    <motion.div
      style={{
        transform,
        opacity,
        zIndex,
        pointerEvents,
        width: cardW,
        height: cardH,
        left: "50%",
        top: "50%",
        marginLeft: -cardW / 2,
        marginTop: -cardH / 2,
        backfaceVisibility: "hidden",
      }}
      className="absolute"
    >
      <motion.div
        style={{ borderColor }}
        className="relative flex h-full w-full flex-col justify-between rounded-2xl border-2 bg-surface p-5 text-left shadow-lift"
      >
        {/* violet focus ring */}
        <motion.span
          aria-hidden
          style={{ opacity: ringOpacity }}
          className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-violet/40"
        />

        <div className="flex items-start justify-end">
          <span className="text-xs font-medium text-muted">{subject.name}</span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <Icon className={cn("h-24 w-24", subject.color)} aria-hidden strokeWidth={1.5} />
        </div>

        <div>
          <span className="block truncate text-lg font-bold text-ink">{subject.name}</span>
          <span className="block text-sm text-muted">
            {subject.count.toLocaleString()} items
          </span>
        </div>

        <Link
          href={`/explore/${subject.slug}`}
          className="absolute inset-0 rounded-2xl"
          aria-label={`Explore ${subject.name}`}
        />
      </motion.div>
    </motion.div>
  );
}

/** Motion-free fallback: the original responsive grid of subject tiles. */
function Grid({ subjects }: { subjects: Subject[] }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {subjects.map((subject) => {
        const Icon = subject.icon;
        return (
          <Link
            key={subject.slug}
            href={`/explore/${subject.slug}`}
            className="group flex flex-col gap-6 rounded-card border border-hairline bg-surface p-4 transition-colors hover:border-violet hover:bg-lavender/40"
          >
            <Icon className={cn("h-6 w-6", subject.color, "group-hover:text-violet")} aria-hidden />
            <span className="min-w-0">
              <span className="block truncate font-semibold text-ink group-hover:text-violet">
                {subject.name}
              </span>
              <span className="block text-sm text-muted">
                {subject.count.toLocaleString()} items
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function SubjectCarousel({ subjects = SUBJECTS }: { subjects?: Subject[] }) {
  const container = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const [dims, setDims] = useState<Dims>({ cardW: 210, cardH: 300, spreadX: 200 });

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const cardW =
        w >= 640
          ? Math.min(Math.max(Math.round(w * 0.18), 240), 300) // desktop: 240–300
          : Math.min(Math.round(w * 0.6), 230); // mobile: up to 230
      setDims({
        cardW,
        cardH: Math.round(cardW * 1.3),
        spreadX: Math.max(150, Math.min(w * 0.3, 460)),
      });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });
  // Short lead-in/out (hold the first & last card), then smooth the spin.
  const raw = useTransform(scrollYProgress, [0.06, 0.94], [0, subjects.length - 1], {
    clamp: true,
  });
  const focus = useSpring(raw, { stiffness: 140, damping: 26, mass: 0.4 });

  if (reduce) return <Grid subjects={subjects} />;

  return (
    <div
      ref={container}
      style={{ height: `calc(100vh + ${(subjects.length - 1) * PER_CARD_VH}vh)` }}
    >
      <div
        className="sticky top-0 h-screen overflow-hidden [perspective:1400px]"
        style={{ ["--anchor" as string]: ANCHOR }}
      >
        {/* Entrance: the whole deck slides in from the right the first time the
            section enters view; scroll then drives the coverflow from there. */}
        <motion.div
          initial={{ x: "42vw", opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-1/2 top-[var(--anchor)] h-0 w-0 [transform-style:preserve-3d]"
        >
          {subjects.map((subject, i) => (
            <FlowCard
              key={subject.slug}
              subject={subject}
              index={i}
              count={subjects.length}
              focus={focus}
              dims={dims}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
