import type { Metadata } from "next";
import { SettingsList } from "@/features/profile";
import { BackButton } from "@/components/layout/BackButton";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 md:pb-12">
      <div className="flex items-center gap-2 pt-4">
        <BackButton fallbackHref="/profile" label="" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      <div className="mt-6">
        <SettingsList />
      </div>
    </div>
  );
}
