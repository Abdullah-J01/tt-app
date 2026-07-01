import Link from "next/link";
import { BookOpen, Layers, Smartphone, Sparkles } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { SubjectCard } from "@/features/explore";
import { CardRail, ContentCard, SectionHeader } from "@/components/ui";
import { listStudybooks } from "@/lib/api";
import { SITE } from "@/config/site";
import { SUBJECTS } from "@/config/subjects";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import FeatureCardsLoader from "@/components/home/FeatureCardsLoader";

const formatPrice = (eur?: number) =>
  eur != null ? `${eur.toFixed(2)}€` : undefined;

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
      <Navbar />
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

        {/* New study bites — horizontal (row) cards: media + title + description + meta.
            Scrolls on mobile, becomes a 2-up grid on desktop. */}
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
          <CardRail columns={2} itemWidth="w-[86%] sm:w-96" label="New study bites">
            {books.map((book) => (
              <ContentCard
                key={book.id}
                layout="horizontal"
                href={`/studybook/${book.slug}`}
                title={book.title}
                description={book.synopsis}
                price={formatPrice(book.priceEur)}
                pricePrefix="from"
                tags={[
                  { label: book.category, icon: <Sparkles aria-hidden />, variant: "ink" },
                  { label: book.author },
                ]}
              />
            ))}
          </CardRail>
        </section>

        {/* Freshly digitized — vertical (tile) cards: no description. Stays a
            horizontal scroll rail at every breakpoint. */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
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
          <CardRail itemWidth="w-40 sm:w-48" label="Freshly digitized">
            {books.map((book) => (
              <ContentCard
                key={book.id}
                layout="vertical"
                href={`/studybook/${book.slug}`}
                title={book.title}
                description={book.synopsis}
                price={formatPrice(book.priceEur)}
                tags={[
                  { label: book.category, icon: <BookOpen aria-hidden /> },
                  { label: book.author },
                ]}
              />
            ))}
          </CardRail>
        </section>
      
      <Footer />
    </main>
  );
}
