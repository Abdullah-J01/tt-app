import type { Metadata } from "next";
import { SettingsScreen, findSettingsItem } from "@/features/profile";
import { BackButton } from "@/components/layout/BackButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  return { title: findSettingsItem(section)?.label ?? "Settings" };
}

/** A settings detail screen (Notifications, App Preferences, App Icon, …). */
export default async function SettingsDetailPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = findSettingsItem(section)?.label ?? "Settings";

  return (
    <>
      <div className="flex items-center gap-2 pt-4">
        <BackButton fallbackHref="/profile/settings" label="" />
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      <div className="mt-6">
        <SettingsScreen section={section} />
      </div>
    </>
  );
}
