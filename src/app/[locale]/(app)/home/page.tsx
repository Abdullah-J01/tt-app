import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { AuthGate } from "@/components/auth/AuthGate";
import { HomeView } from "@/features/dashboard/components/HomeView";
import { getHomeData } from "@/features/dashboard/data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_app_home_page");
  return { title: t("metadataTitle") };
}

/** Logged-in landing page: Continue, Your Library, Popular, New. Guests get an in-page sign-in panel. */
export default async function HomePage() {
  const { popular, freshlyAdded } = await getHomeData();
  return (
    <AuthGate>
      <HomeView popular={popular} freshlyAdded={freshlyAdded} />
    </AuthGate>
  );
}
