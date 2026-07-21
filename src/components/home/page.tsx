import Link from "@/i18n/Link";
import { getTranslations } from "@/i18n/server";
import { BookOpen, Layers, Smartphone } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui";
import { listStudybooks } from "@/lib/api";
import { SITE } from "@/config/site";
import StackingStudyBitesLoader from "@/components/home/StackingStudyBitesLoader";
import UniverseCarouselLoader from "@/components/home/UniverseCarouselLoader";
import { ExploreSection } from "@/components/home/ExploreSection";
import { SubjectGrid } from "@/components/home/SubjectGrid";
import HeroLoader from "@/components/home/HeroLoader";
import FeatureCardsLoader from "@/components/home/FeatureCardsLoader";
import PremiumPlansPage from "@/components/home/Plans";
import { BITE_COUNT } from "@/config/studyBites";
import { toDeckBook } from "@/components/home/deckBook";
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
  const t = await getTranslations("components_home_page");
  // One small page — not the catalogue — feeds both decks below. They take
  // disjoint slices so the same titles don't appear in both sections; the
  // carousel shows 5 (its reduced-motion fallback renders a rail of whatever
  // it's given, so hand it exactly that many).
  const { items: books } = await listStudybooks({ limit: 12 });
  const biteBooks = books.slice(0, BITE_COUNT).map(toDeckBook);
  const carouselBooks = books.slice(BITE_COUNT, BITE_COUNT + 5).map(toDeckBook);

  return (
    <main className="relative min-h-screen bg-white">
      <HeroLoader />
      <FeatureCardsLoader />

      {/* Mobile: overlap the reveal's blank top over FeatureCards' blank bottom —
          both are pinned full-screen stages with centred content, so the seam
          between them otherwise reads as a huge empty gap on small screens. */}
      <div>
        <ExploreSection />
      </div>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <SectionHeader
          title={t("bitesTitle")}
          subtitle={t("bitesSubtitle")}
          action={
            <Link href="/explore">
              <Button variant="secondary" size="sm">
                {t("moreBites")}
              </Button>
            </Link>
          }
        />
        <StackingStudyBitesLoader books={biteBooks} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <SectionHeader
          title={t("digitizedTitle")}
          subtitle={t("digitizedSubtitle")}
          action={
            <Link href="/library">
              <Button variant="secondary" size="sm">
                {t("allEbooks")}
              </Button>
            </Link>
          }
        />
        <UniverseCarouselLoader books={carouselBooks} />
      </section>

      <PremiumPlansPage />
    </main>
  );
}
