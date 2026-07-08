import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { SettingsList } from "@/features/profile";
import { BackButton } from "@/components/layout/BackButton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_app_profile_settings_page");
  return { title: t("title") };
}

export default async function SettingsPage() {
  const t = await getTranslations("app_app_profile_settings_page");
  return (
    <>
      <div className="flex items-center gap-2 pt-4">
        <BackButton fallbackHref="/profile" label="" />
        <h1 className="text-3xl font-bold">{t("title")}</h1>
      </div>
      <div className="mt-6">
        <SettingsList />
      </div>
    </>
  );
}
