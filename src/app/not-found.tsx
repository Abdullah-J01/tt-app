import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_not_found");
  return { title: t("metaTitle") };
}

/**
 * Playful, on-brand 404: plum gradient, an orbiting "planet" as the middle 0,
 * and an astronomy-flavoured message. Pure CSS/SVG motion (respects reduced-motion).
 */
export default async function NotFound() {
  const t = await getTranslations("app_not_found");
  return (
    <main className="bg-plum relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center text-white">
      {/* Top glow + twinkling stars (behind content, non-interactive) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-1/2 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(255,255,255,0.14),transparent)]"
      />
      <Stars />

      <div className="relative z-10 w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
          {t("kicker")}
        </p>

        {/* 404 with an orbit as the middle 0 */}
        <div className="mt-6 flex items-center justify-center gap-1 sm:gap-2">
          <span className="font-display text-[6.5rem] font-extrabold leading-none sm:text-[8rem]">4</span>
          <Orbit />
          <span className="font-display text-[6.5rem] font-extrabold leading-none sm:text-[8rem]">4</span>
        </div>

        <h1 className="mt-8 text-3xl font-bold leading-tight text-white sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 leading-relaxed text-white/70">
          {t("subtitle")}
        </p>

        <div className="mt-10 space-y-3">
          <Link
            href="/feed"
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-violet text-base font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {t("backToFeed")}
          </Link>
          <Link
            href="/explore"
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-white/10 text-base font-semibold text-white ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/15"
          >
            {t("exploreStudybooks")}
          </Link>
        </div>
      </div>
    </main>
  );
}

/** The middle "0": a ring with a glowing moon and an orbiting amber dot. */
function Orbit() {
  return (
    <div className="relative mx-0.5 h-24 w-24 shrink-0 sm:h-28 sm:w-28">
      {/* Orbit ring */}
      <div className="absolute inset-0 rounded-full border border-white/25" />

      {/* Orbiting amber dot */}
      <div className="animate-orbit absolute inset-0">
        <span className="absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber shadow-[0_0_14px_rgba(244,169,59,0.8)]" />
      </div>

      {/* Central glowing moon */}
      <span className="animate-floaty absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white to-[#8f74f0] shadow-[0_0_34px_rgba(143,116,240,0.75)] sm:h-14 sm:w-14" />
    </div>
  );
}

/** Faint twinkling stars over the plum sky. */
function Stars() {
  const stars = [
    { top: "16%", left: "18%", d: "0s", s: 4 },
    { top: "24%", left: "80%", d: "0.7s", s: 5 },
    { top: "62%", left: "12%", d: "1.2s", s: 4 },
    { top: "70%", left: "86%", d: "0.4s", s: 6 },
    { top: "40%", left: "8%", d: "1.5s", s: 3 },
    { top: "48%", left: "92%", d: "0.9s", s: 4 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {stars.map((st, i) => (
        <span
          key={i}
          className="animate-twinkle absolute rounded-full bg-white"
          style={{ top: st.top, left: st.left, width: st.s, height: st.s, animationDelay: st.d }}
        />
      ))}
    </div>
  );
}
