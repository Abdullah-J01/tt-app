"use client";

import dynamic from "next/dynamic";

const FeatureCards = dynamic(() => import("./FeatureCards"), {
  ssr: false,
  loading: () => (
    <section className="relative flex h-screen py-10 items-center overflow-hidden">
      {/* Mirrors the pinned horizontal row so the swap-in isn't jarring */}
      <div className="flex w-max gap-5 px-[6vw] sm:gap-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-xl3 shadow-soft bg-ink/5 relative h-[22rem]  shrink-0 overflow-hidden w-fit"
          >
            <div className="animate-shimmer absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.65),transparent)] bg-[length:200%_100%]" />
          </div>
        ))}
      </div>
    </section>
  ),
});

export default function FeatureCardsLoader() {
  return <FeatureCards />;
}
