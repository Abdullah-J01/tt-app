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
  const books = await listStudybooks();

  return (
    <main className="relative min-h-screen bg-white">
      <HeroLoader />
      <FeatureCardsLoader />

      <div className="h-10"></div>

      <ExploreSection />

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
        <StackingStudyBitesLoader />
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
        <UniverseCarouselLoader books={books} />
      </section>

      <PremiumPlansPage />
    </main>
  );
}
