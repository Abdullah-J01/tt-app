import Link from "next/link";
import { BookOpen, Layers, Smartphone } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { SubjectCard } from "@/components/ui/SubjectCard";
import { SITE } from "@/config/site";
import { SUBJECTS } from "@/config/subjects";

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
export default function LandingPage() {
  return (
    <>
      <TopNav />

      <main>
        {/* Hero */}
        <section className="bg-lavender">
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
            </div>

            {/* Phone mock showing the vertical feed */}
            <div className="justify-self-center">
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
        </section>

        {/* Feature cards */}
        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
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
        </section>

        {/* Subject grid */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="text-2xl font-bold">Explore by subject</h2>
          <p className="mt-1 text-muted">Pick a subject and start learning in seconds.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SUBJECTS.map((s) => (
              <SubjectCard key={s.slug} subject={s} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
