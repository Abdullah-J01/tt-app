import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { ProfileView } from "@/features/profile";
import { AuthGate } from "@/components/auth/AuthGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_app_profile_page");
  return { title: t("metaTitle") };
}

/** Profile home (UI brief §6.7). Guests get an in-page sign-in panel. */
export default function ProfilePage() {
  return (
    <AuthGate>
      <ProfileView />
    </AuthGate>
  );
}
