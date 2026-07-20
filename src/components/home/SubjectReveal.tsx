"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "@/i18n/Link";
import { useTranslations } from "@/i18n/client";
import { useSubjectName } from "@/i18n/useSubjectName";
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

type SubjectCardData = { subject: (typeof SUBJECTS)[number]; dir: Dir };

/** Tracks the user's reduced-motion preference (replaces Framer's hook). */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** True below the `sm` breakpoint (< 640px). Mobile gets a simpler time-based
 *  reveal instead of the desktop scroll-scrubbed zoom. Initialised from the
 *  media query on mount (client-only component) so there's no desktop→mobile flash. */
function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return mobile;
}

/**
 * "Explore by subject" — a scroll-controlled reveal (pure CSS, no motion library).
 * A tiny scroll listener writes the section's scroll progress into the `--p` CSS
 * variable; every animated element is a paused CSS animation frozen to `--p` via
 * a negative animation-delay, so it scrubs with scroll like the old Framer version.
 * Desktop (sm+): the centre circle zooms through and the subject cards fly in from
 * every direction. Mobile (< sm): the same centre reveal, then an "Explore by
 * subject" card swings in that opens a scrollable dialog with every subject.
 */
export function SubjectReveal() {
  const t = useTranslations("components_home_SubjectReveal");
  const subjectName = useSubjectName();
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [cardIn, setCardIn] = useState(false);
  const [inView, setInView] = useState(false);
  useScrollLock(open);

  // Mobile: trigger the time-based entrance once the section scrolls into view.
  useEffect(() => {
    if (!isMobile || reduced) return;
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isMobile, reduced]);

  // Measure scroll progress through the pinned track and publish it as --p, but
  // ease the published value toward the raw scroll target each frame (a lerp) so
  // the whole reveal glides instead of stepping with the scroll — the buttery
  // feel Framer got from spring-smoothing its scroll MotionValue. The mobile
  // card's inner stagger fires once the eased progress passes the halfway point.
  useEffect(() => {
    if (reduced || isMobile) return;
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;
    let running = false;
    let current = 0;
    let target = 0;

    const readTarget = () => {
      const rect = el.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      target = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0;
    };
    const publish = (p: number) => {
      el.style.setProperty("--p", p.toFixed(4));
      setCardIn(p > 0.5);
    };
    const tick = () => {
      // Ease ~10% of the remaining gap per frame; snap + stop once close enough.
      current += (target - current) * 0.1;
      if (Math.abs(target - current) < 0.0004) {
        current = target;
        running = false;
      }
      publish(current);
      if (running) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      readTarget();
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    readTarget();
    current = target;
    publish(current);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      cancelAnimationFrame(raf);
    };
  }, [reduced, isMobile]);

  const cards = useMemo<SubjectCardData[]>(
    () =>
      SUBJECTS.map((subject, i) => ({ subject, dir: DIRECTIONS[i % DIRECTIONS.length] ?? "left" })),
    [],
  );

  // The "Explore by subject" card — shared by the desktop-scrub layout and the
  // mobile time-based layout. Its inner content staggers in once revealed.
  const staggerIn = reduced || cardIn || inView;
  const exploreCard = (
    <div className="bg-plum-gradient border-lilac relative flex min-h-[26rem] w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-[2rem] border px-8 py-14 text-center text-white shadow-[0_24px_70px_-24px_rgba(72,54,102,0.7)]">
      <div
        className={cn(
          "subject-card-stagger flex w-full flex-col items-center",
          staggerIn && "is-in",
        )}
      >
        <p className="text-xs font-semibold tracking-[0.18em] text-white uppercase">
          {t("exploreBySubject")}
        </p>
        <h3 className="font-display mt-2 text-3xl leading-tight font-bold text-white">
          {t("diveIn", { count: SUBJECTS.length })}
        </h3>

        {/* subject icon preview + "see more" */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
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
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-lilac relative mt-8 inline-flex w-full items-center justify-center overflow-hidden rounded-2xl py-4 text-base font-semibold text-white transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
        >
          <span className="relative z-10">{t("exploreBySubject")}</span>
          <span
            aria-hidden
            className="subject-btn-shine absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />
        </button>
      </div>
    </div>
  );

  // Mobile: a simple on-view entrance — circle fades in, heading ~1s later, then
  // the card — with a 100px band above and below the circle. No scroll zoom.
  if (isMobile && !reduced) {
    return (
      <>
        <section ref={sectionRef} className="relative bg-white">
          <div className={cn("reveal-m", inView && "is-in")}>
            <div className="flex justify-center px-6 pt-[100px] pb-[100px]">
              <div className="reveal-m-circle relative h-[19rem] w-[19rem] max-w-full">
                <div
                  aria-hidden
                  className="subject-glow absolute inset-0 m-auto rounded-full blur-[64px]"
                />
                <svg
                  viewBox="0 0 200 200"
                  aria-hidden
                  className="absolute inset-0 m-auto h-full w-full animate-spin will-change-transform [animation-duration:44s]"
                >
                  <defs>
                    <linearGradient id="mDashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6c4ce3" />
                      <stop offset="100%" stopColor="#9c85f0" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="100"
                    cy="100"
                    r="98"
                    fill="none"
                    stroke="url(#mDashGrad)"
                    strokeOpacity={0.45}
                    strokeWidth={0.5}
                    strokeDasharray="1.5 3"
                  />
                </svg>
                <svg
                  viewBox="0 0 200 200"
                  aria-hidden
                  className="absolute inset-0 m-auto h-[84%] w-[84%] animate-spin will-change-transform [animation-direction:reverse] [animation-duration:60s]"
                >
                  <defs>
                    <radialGradient id="mBlobGrad" cx="50%" cy="42%" r="62%">
                      <stop offset="0%" stopColor="rgba(108,76,227,0.12)" />
                      <stop offset="65%" stopColor="rgba(108,76,227,0.04)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                  </defs>
                  <path
                    d={WAVY_RING}
                    fill="url(#mBlobGrad)"
                    stroke="#6c4ce3"
                    strokeOpacity={0.4}
                    strokeWidth={1}
                    strokeLinejoin="round"
                  />
                </svg>
                <div aria-hidden className="absolute inset-0 m-auto h-full w-full">
                  <div className="relative h-full w-full animate-spin will-change-transform [animation-duration:24s]">
                    <span className="bg-violet absolute top-0 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_16px_rgba(108,76,227,0.6)]" />
                  </div>
                </div>
                <div className="reveal-m-text absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                  <h2 className="font-display leading-[0.82] font-extrabold tracking-tight uppercase">
                    <span className="reveal-m-l1 text-ink block text-4xl">{t("learn")}</span>
                    <span className="reveal-m-l2 text-ink -mt-1 block text-4xl">
                      {t("somethingNew")}
                    </span>
                  </h2>
                  <p className="reveal-m-l3 text-ink/70 mt-4 text-[0.7rem] font-semibold tracking-[0.3em] uppercase">
                    {t("scrollTagline")}
                  </p>
                </div>
              </div>
            </div>
            <div className="reveal-m-card flex justify-center px-5 pb-[100px]">{exploreCard}</div>
          </div>
        </section>
        {open && renderDialog()}
      </>
    );
  }

  function renderDialog() {
    return (
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
                      <span className="text-ink text-xs font-medium sm:text-sm">
                        {subjectName(s.slug, s.name)}
                      </span>
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
    );
  }

  return (
    <>
      <section
        ref={sectionRef}
        // Tight scroll track (Deepstash-style pacing): the circle zooms/changes
        // over the first few scroll notches, then the next section fades in over
        // the next few — not a long draggy pin. Tune these two vh values to taste.
        className={reduced ? "relative" : "relative h-[160vh] sm:h-[220vh]"}
      >
        <div
          className={cn(
            "flex w-full items-start justify-center overflow-hidden bg-white",
            reduced ? "relative min-h-screen py-16" : "sticky top-0 h-screen",
          )}
        >
          {/* Centre: gradient backdrop + circle + rings + heading. The circle draws
              in first, then the text; scroll zooms it through while the backdrop
              flashes in and back out, so the cards below land on plain white. */}
          {!reduced && (
            <>
              <div
                aria-hidden
                className="subject-scrub-fill pointer-events-none absolute inset-0 z-0 hidden"
              />
              <div
                // max-sm offsets nudge the whole centred composition (rings, glow,
                // heading) up a bit, shrinking the blank band above it on phones.
                className="subject-centre pointer-events-none absolute inset-0 z-20 flex items-center justify-center max-sm:-top-16 max-sm:bottom-16"
              >
                <div className="subject-scrub-rings absolute inset-0">
                  <div
                    aria-hidden
                    className="subject-glow absolute inset-0 m-auto h-[24rem] w-[24rem] rounded-full blur-[70px] sm:h-[34rem] sm:w-[34rem] sm:blur-[90px] md:h-[42rem] md:w-[42rem]"
                  />
                  <div
                    aria-hidden
                    className="subject-glow-dark subject-scrub-glowdark absolute inset-0 m-auto h-[24rem] w-[24rem] rounded-full blur-[70px] sm:hidden"
                  />
                  <svg
                    viewBox="0 0 200 200"
                    aria-hidden
                    className="absolute inset-0 m-auto h-[21rem] w-[21rem] animate-spin will-change-transform [animation-duration:44s] sm:h-[33rem] sm:w-[33rem] md:h-[46rem] md:w-[46rem]"
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
                  <svg
                    viewBox="0 0 200 200"
                    aria-hidden
                    className="absolute inset-0 m-auto h-[18rem] w-[18rem] animate-spin will-change-transform [animation-direction:reverse] [animation-duration:60s] sm:h-[28rem] sm:w-[28rem] md:h-[38rem] md:w-[38rem]"
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
                  <div
                    aria-hidden
                    className="absolute inset-0 m-auto h-[21rem] w-[21rem] sm:h-[33rem] sm:w-[33rem] md:h-[46rem] md:w-[46rem]"
                  >
                    <div className="relative h-full w-full animate-spin will-change-transform [animation-duration:24s]">
                      <span className="bg-violet absolute top-0 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_16px_rgba(108,76,227,0.6)]" />
                    </div>
                  </div>
                </div>
                <div className="subject-scrub-text relative px-6 text-center">
                  <h2 className="font-display leading-[0.82] font-extrabold tracking-tight uppercase [text-shadow:0_2px_18px_rgba(30,20,60,0.45)] sm:[text-shadow:none]">
                    <span className="sm:text-ink block text-5xl text-white sm:text-6xl md:text-8xl">
                      {t("learn")}
                    </span>
                    <span className="sm:text-ink -mt-1 block text-5xl text-white sm:-mt-3 sm:text-6xl md:-mt-4 md:text-8xl">
                      {t("somethingNew")}
                    </span>
                  </h2>
                  <p className="text-ink mt-6 text-xs font-semibold tracking-[0.35em] uppercase sm:text-sm">
                    {t("scrollTagline")}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Subject grid — DESKTOP/TABLET only (sm+); flies the cards in. */}
          <div
            className={cn(
              "relative z-10 mx-auto hidden max-w-6xl grid-cols-2 items-center gap-2.5 px-5 pt-24 pb-16 sm:grid sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:pt-28 lg:grid-cols-5 lg:gap-4",
              !reduced && "subject-scrub-grid",
            )}
          >
            {cards.map((card, i) => (
              <SubjectCard
                key={card.subject.slug}
                card={card}
                index={i}
                total={cards.length}
                reduced={reduced}
              />
            ))}
          </div>

          {/* Explore card — MOBILE only (< sm); opens the subjects dialog.
              Bottom-anchored with a fixed 100px pad: the pinned frame's bottom ==
              the section's bottom == the next section's top, so the gap to
              "New study bites" is a deterministic 100px on any phone. */}
          <div
            className={cn(
              "absolute inset-0 z-10 flex items-end justify-center px-5 pb-[140px] sm:hidden",
              !reduced && "subject-scrub-cta",
            )}
          >
            <div className="bg-plum-gradient border-lilac relative flex min-h-[26rem] w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-[2rem] border px-8 py-14 text-center text-white shadow-[0_24px_70px_-24px_rgba(72,54,102,0.7)]">
              <div
                className={cn(
                  "subject-card-stagger flex w-full flex-col items-center",
                  (reduced || cardIn) && "is-in",
                )}
              >
                <p className="text-xs font-semibold tracking-[0.18em] text-white uppercase">
                  {t("exploreBySubject")}
                </p>
                <h3 className="font-display mt-2 text-3xl leading-tight font-bold text-white">
                  {t("diveIn", { count: SUBJECTS.length })}
                </h3>

                {/* subject icon preview + "see more" */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
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
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="bg-lilac relative mt-8 inline-flex w-full items-center justify-center overflow-hidden rounded-2xl py-4 text-base font-semibold text-white transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
                >
                  <span className="relative z-10">{t("exploreBySubject")}</span>
                  <span
                    aria-hidden
                    className="subject-btn-shine absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                </button>
              </div>
            </div>
          </div>
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
                        <span className="text-ink text-xs font-medium sm:text-sm">
                          {subjectName(s.slug, s.name)}
                        </span>
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

/** One subject card — scroll flies it in from its direction over its own slice
 *  [start, end] via CSS (@keyframes subjectScrubCard); offsets + window passed
 *  as inline CSS custom properties, scrubbed by the shared --p variable. */
function SubjectCard({
  card,
  index,
  total,
  reduced,
}: {
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
  const Icon = card.subject.icon;

  return (
    <div
      className={cn("will-change-transform", !reduced && "subject-scrub-card")}
      style={
        {
          "--fly-x": `${off.x}px`,
          "--fly-y": `${off.y}px`,
          "--fly-rot": `${off.rotate}deg`,
          "--start": start,
          "--end": end,
        } as CSSProperties
      }
    >
      <Link href={`/explore/${card.subject.slug}`} className="block">
        <div className="border-ink/10 flex flex-col items-center gap-1.5 rounded-2xl border bg-white/80 p-3 text-center shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-1 hover:scale-[1.03] active:scale-[0.98]">
          <Icon className={cn("h-6 w-6", card.subject.color)} strokeWidth={1.75} />
          <span className="text-ink text-sm font-medium">
            {subjectName(card.subject.slug, card.subject.name)}
          </span>
          <span className="text-ink/45 text-xs">
            {t("items", { count: card.subject.count.toLocaleString() })}
          </span>
        </div>
      </Link>
    </div>
  );
}
