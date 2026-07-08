import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { ProfileView } from "@/features/profile";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_app_profile_page");
  return { title: t("metaTitle") };
}

/** Profile home (UI brief §6.7). */
export default function ProfilePage() {
  return <ProfileView />;
}
