import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getTranslations } from "@/i18n/server";
import { HomeView } from "@/features/dashboard/components/HomeView";
import { getHomeData } from "@/features/dashboard/data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_app_home_page");
  return { title: t("metadataTitle") };
}


export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");
  const { popular, freshlyAdded } = await getHomeData();
  return <HomeView popular={popular} freshlyAdded={freshlyAdded} />;
}
