"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "@/i18n/Link";
import { useTranslations } from "@/i18n/client";
import { useSubjectName } from "@/i18n/useSubjectName";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import { Plus, X } from "lucide-react";
import { SUBJECTS } from "@/config/subjects";
import { cn } from "@/lib/utils";
import { Portal } from "@/lib/Portal";
import { useScrollLock } from "@/lib/useScrollLock";

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

/** Staggered fade-up for the mobile card's inner elements. */
const CARD_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const CARD_ITEM: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

type SubjectCardData = { subject: (typeof SUBJECTS)[number]; dir: Dir };

/**
 * "Explore by subject" — a scroll-controlled reveal (Framer Motion). Desktop
 * (sm+): the centre circle zooms through and the subject cards fly in from every
 * direction. Mobile (< sm): the same centre reveal, then an "Explore by subject"
 * card fades in that opens a scrollable dialog with every subject.
 */
export function SubjectReveal() {
  const t = useTranslations("components_home_SubjectReveal");
  const subjectName = useSubjectName();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [cardIn, setCardIn] = useState(false);
  useScrollLock(open);

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

  // Trigger the mobile card's inner stagger once the card starts revealing.
  useEffect(() => {
    if (reduced) return;
    const unsub = scrollYProgress.on("change", (v) => setCardIn(v > 0.5));
    return () => unsub();
  }, [reduced, scrollYProgress]);

  const cards = useMemo<SubjectCardData[]>(
    () =>
      SUBJECTS.map((subject, i) => ({ subject, dir: DIRECTIONS[i % DIRECTIONS.length] ?? "left" })),
    [],
  );

  // Phase 1a (0 → 0.18): centre holds. 1b (0.18 → 0.4): zoom + fade out.
  const centreScale = useTransform(scrollYProgress, [0, 0.18, 0.42], [1, 1, 2.8]);
  const centreOpacity = useTransform(scrollYProgress, [0, 0.18, 0.4], [1, 1, 0]);
  const rippleScale = useTransform(scrollYProgress, [0.18, 0.42], [1, 4.2]);
  const rippleOpacity = useTransform(scrollYProgress, [0.18, 0.3, 0.42], [0, 0.4, 0]);
  // Phase 2 (0.46 →): once the centre is gone the grid / mobile card comes in.
  const gridOpacity = useTransform(scrollYProgress, [0.46, 0.54], [0, 1]);
  const ctaOpacity = useTransform(scrollYProgress, [0.46, 0.56], [0, 1]);
  const ctaScale = useTransform(scrollYProgress, [0.46, 0.62], [0.92, 1]);
  const ctaX = useTransform(scrollYProgress, [0.46, 0.64], [-300, 0]);
  const ctaRotate = useTransform(scrollYProgress, [0.46, 0.64], [-80, 0]);

  return (
    <>
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
              // max-sm offsets nudge the whole centred composition (rings, glow,
              // heading) up a bit, shrinking the blank band above it on phones.
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center max-sm:-top-16 max-sm:bottom-16"
            >
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  aria-hidden
                  style={{ scale: rippleScale, opacity: rippleOpacity }}
                  className="bg-plum-gradient pointer-events-none absolute inset-0 z-[14] m-auto h-64 w-64 rounded-full md:h-72 md:w-72"
                />
              ))}
              <div className="absolute inset-0">
                <div
                  aria-hidden
                  className="absolute inset-0 m-auto h-[24rem] w-[24rem] rounded-full blur-[70px] sm:h-[34rem] sm:w-[34rem] sm:blur-[90px] md:h-[42rem] md:w-[42rem]"
                  style={{
                    background:
                      "radial-gradient(circle, rgb(var(--color-violet-rgb) / 0.34) 0%, rgb(var(--color-violet-rgb) / 0.12) 42%, transparent 70%)",
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
              <div className="relative px-6 text-center">
                <h2 className="font-display leading-[0.82] font-extrabold tracking-tight uppercase">
                  <span className="text-ink block text-4xl sm:text-6xl md:text-8xl">{t("learn")}</span>
                  <span className="text-violet/25 -mt-1 block text-4xl sm:-mt-3 sm:text-6xl md:-mt-4 md:text-8xl">
                    {t("somethingNew")}
                  </span>
                </h2>
                <p className="text-muted mt-6 text-xs font-semibold tracking-[0.35em] uppercase sm:text-sm">
                  {t("scrollTagline")}
                </p>
              </div>
            </motion.div>
          )}

          {/* Subject grid — DESKTOP/TABLET only (sm+); flies the cards in. */}
          <motion.div
            style={reduced ? undefined : { opacity: gridOpacity }}
            className="relative z-10 mx-auto hidden max-w-6xl grid-cols-2 items-center gap-2.5 px-5 pt-24 pb-16 sm:grid sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:pt-28 lg:grid-cols-5 lg:gap-4"
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

          {/* Explore card — MOBILE only (< sm); opens the subjects dialog. */}
          <motion.div
            style={
              reduced
                ? undefined
                : {
                    opacity: ctaOpacity,
                    scale: ctaScale,
                    x: ctaX,
                    rotateY: ctaRotate,
                    transformPerspective: 1200,
                    transformOrigin: "left center",
                  }
            }
            className="absolute inset-0 -top-16 bottom-16 z-10 flex items-center justify-center px-5 sm:hidden"
          >
            <div className="bg-plum-gradient border-lilac relative flex min-h-[26rem] w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-[2rem] border px-8 py-14 text-center text-white shadow-[0_24px_70px_-24px_rgba(72,54,102,0.7)]">
              <motion.div
                variants={CARD_CONTAINER}
                initial={reduced ? false : "hidden"}
                animate={reduced || cardIn ? "show" : "hidden"}
                className="flex w-full flex-col items-center"
              >
                <motion.p
                  variants={CARD_ITEM}
                  className="text-xs font-semibold tracking-[0.18em] text-white uppercase"
                >
                  {t("exploreBySubject")}
                </motion.p>
                <motion.h3
                  variants={CARD_ITEM}
                  className="font-display text-lilac mt-2 text-3xl leading-tight font-bold"
                >
                  {t("diveIn", { count: SUBJECTS.length })}
                </motion.h3>

                {/* subject icon preview + "see more" */}
                <motion.div
                  variants={CARD_ITEM}
                  className="mt-6 flex flex-wrap items-center justify-center gap-2"
                >
                  {SUBJECTS.slice(0, 4).map((s) => {
                    const Icon = s.icon;
                    return (
                      <span
                        key={s.slug}
                        className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15"
                      >
                        <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                      </span>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex h-11 items-center gap-1 rounded-xl bg-white/15 px-3 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/25"
                  >
                    <Plus className="h-4 w-4" />
                    {t("more", { count: SUBJECTS.length - 4 })}
                  </button>
                </motion.div>

                <motion.button
                  variants={CARD_ITEM}
                  type="button"
                  onClick={() => setOpen(true)}
                  className="bg-lilac relative mt-8 inline-flex w-full items-center justify-center overflow-hidden rounded-2xl py-4 text-base font-semibold text-white transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
                >
                  <span className="relative z-10">{t("exploreBySubject")}</span>
                  <motion.span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ["-160%", "460%"] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 0.8,
                    }}
                  />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {open && (
        <Portal>
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={t("exploreBySubject")}
          >
            <div className="fade-in absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="drawer-up bg-surface relative flex max-h-[85vh] w-full flex-col rounded-t-2xl md:max-w-2xl md:rounded-2xl">
              <div className="border-hairline flex items-center justify-between border-b px-5 py-4">
                <h2 className="font-display text-ink text-lg font-bold">{t("exploreBySubject")}</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("close")}
                  className="hover:bg-lavender grid h-9 w-9 place-items-center rounded-full active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain p-4">
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                  {SUBJECTS.map((s) => {
                    const Icon = s.icon;
                    return (
                      <Link
                        key={s.slug}
                        href={`/explore/${s.slug}`}
                        onClick={() => setOpen(false)}
                        className="border-ink/10 hover:border-violet flex flex-col items-center gap-1.5 rounded-2xl border bg-white p-3 text-center transition-colors active:scale-95"
                      >
                        <Icon className={cn("h-6 w-6", s.color)} strokeWidth={1.75} />
                        <span className="text-ink text-xs font-medium sm:text-sm">{subjectName(s.slug, s.name)}</span>
                        <span className="text-ink/45 text-[10px] sm:text-xs">
                          {t("items", { count: s.count.toLocaleString() })}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
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
  const t = useTranslations("components_home_SubjectReveal");
  const subjectName = useSubjectName();
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
          <span className="text-ink text-sm font-medium">{subjectName(card.subject.slug, card.subject.name)}</span>
          <span className="text-ink/45 text-xs">{t("items", { count: card.subject.count.toLocaleString() })}</span>
        </motion.div>
      </Link>
    </motion.div>
  );
}
