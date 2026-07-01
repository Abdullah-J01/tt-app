"use client";

import dynamic from "next/dynamic";

const FeatureCards = dynamic(() => import("./FeatureCards"), {
  ssr: false,
  loading: () => (
    <section className="px-5 sm:px-8 max-w-7xl mx-auto pb-28">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl3 h-[22rem] bg-ink/5 animate-pulse"
          />
        ))}
      </div>
    </section>
  ),
});

export default function FeatureCardsLoader() {
  return <FeatureCards />;
}
