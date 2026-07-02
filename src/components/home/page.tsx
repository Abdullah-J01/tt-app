import Link from "next/link";
import { BookOpen, Layers, Smartphone } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui";
import { listStudybooks } from "@/lib/api";
import { SITE } from "@/config/site";
import { StackingStudyBites } from "@/components/home/StackingStudyBites";
import { UniverseCarousel } from "@/components/home/UniverseCarousel";
import { ExploreSection } from "@/components/home/ExploreSection";
import Hero from "@/components/home/Hero";
import FeatureCardsLoader from "@/components/home/FeatureCardsLoader";

const FEATURES = [
  {
    icon: Layers,
    title: "Bite-sized cards",
    body: "Swipe through short, beautifully designed learning cards — one idea at a time.",
  },
  {
    icon: BookOpen,
    title: "Thousands of studybooks",
    body: "Every subject and grade, distilled into cards you actually finish.",
  },
  {
    icon: Smartphone,
    title: "Learn on any device",
    body: "Mobile, desktop, iOS and Android — your streak follows you everywhere.",
  },
];

/** Marketing landing page (UI brief §6.8). */
export default async function LandingPage() {
  const books = await listStudybooks();

  return (
    <main className="relative min-h-screen bg-white">
      <Hero />
      <FeatureCardsLoader />

      {/* <TopNav /> */}

      {/* Hero */}
      {/* <section className="bg-lavender">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
            <div>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">{SITE.tagline}</h1>
              <p className="mt-4 max-w-md text-lg text-muted">{SITE.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/onboarding">
                  <Button size="lg">Get started</Button>
                </Link>
                <Link href="/feed">
                  <Button size="lg" variant="secondary">
                    See the feed
                  </Button>
                </Link>
              </div>
            </div> */}

      {/* Phone mock showing the vertical feed */}
      {/* <div className="justify-self-center">
              <div className="flex h-[520px] w-[260px] flex-col justify-between rounded-[2.5rem] border-8 border-ink bg-plum p-5 text-white shadow-soft">
                <div className="flex gap-1">
                  <span className="h-1 flex-1 rounded-full bg-white" />
                  <span className="h-1 flex-1 rounded-full bg-white/30" />
                  <span className="h-1 flex-1 rounded-full bg-white/30" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-tight">A story is a promise to the reader.</p>
                  <p className="mt-3 text-sm text-white/80">
                    The opening sets an expectation the rest of the book must pay off.
                  </p>
                </div>
                <p className="text-xs text-white/70">Swipe up for the next idea ↑</p>
              </div>
            </div>
          </div>
        </section> */}

      {/* Feature cards */}
      {/* <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-plum rounded-card p-6 text-white shadow-soft">
                <Icon className="h-8 w-8" aria-hidden />
                <h3 className="mt-4 text-xl font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-white/85">{f.body}</p>
              </div>
            );
          })}
        </section> */}

        {/* Explore by subject — scroll-spun 3D coverflow of subject cards. */}
        <ExploreSection />

        {/* New study bites — a scroll-stacked deck of horizontal cards. Each card
            pins near the top and recedes as the next scrolls up to cover it. */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <SectionHeader
            title="New study bites"
            subtitle="Study bites help you focus on one specific topic."
            action={
              <Link href="/explore">
                <Button variant="secondary" size="sm">
                  More bites
                </Button>
              </Link>
            }
          />
          <StackingStudyBites />
        </section>

        {/* Freshly digitized — a scroll-spun 3D drum. Each cover revolves up to a
            flat, focused center as you scroll; neighbors tilt away in perspective. */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <SectionHeader
            title="Freshly digitized"
            subtitle="Digital textbooks and workbooks — study anywhere, anytime."
            action={
              <Link href="/library">
                <Button variant="secondary" size="sm">
                  All e-books
                </Button>
              </Link>
            }
          />
          <UniverseCarousel books={books} />
        </section>

    </main>
  );
}
