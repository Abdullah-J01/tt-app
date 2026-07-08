import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { AchievementsView } from "@/features/achievements";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_app_profile_achievements_page");
  return { title: t("metaTitle") };
}

export default function AchievementsPage() {
  return <AchievementsView />;
}
