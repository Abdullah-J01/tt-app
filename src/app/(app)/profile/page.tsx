import type { Metadata } from "next";
import { Award, Bell, Flame, Globe, Settings, User } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { ProfileHeader } from "@/components/account/ProfileHeader";
import { StatGrid, type Stat } from "@/components/account/StatGrid";
import { PremiumBanner } from "@/components/account/PremiumBanner";
import { SettingsList } from "@/components/account/SettingsList";
import { SettingsRow } from "@/components/account/SettingsRow";
import { LogoutButton } from "@/components/account/LogoutButton";

export const metadata: Metadata = { title: "Profile" };

// TODO(team): replace placeholders with the current user + streak/stats from TT
// (docs/TT_API_ENDPOINTS.md §B/§C).
const USER = { name: "Mia Lepik", handle: "@mialepik · Grade 7", streakDays: 7 };
const STATS: Stat[] = [
  { label: "Cards learned", value: 428 },
  { label: "Day streak", value: 7, accent: true },
  { label: "Completed", value: 6 },
];

/** Profile + streak/stats + settings (UI brief §6.7). */
export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24 md:py-8 md:pb-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Profile</h1>
        <button
          type="button"
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-lavender hover:text-ink"
        >
          <Settings className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-5">
        <ProfileHeader name={USER.name} handle={USER.handle} />

        <div className="flex flex-wrap items-center gap-2">
          <Pill variant="amber" icon={<Flame />}>
            {USER.streakDays}-day streak
          </Pill>
          <Pill variant="green" icon={<Award />}>
            Free plan
          </Pill>
        </div>

        <StatGrid stats={STATS} />

        <PremiumBanner />

        <SettingsList>
          <SettingsRow icon={User} label="Account" />
          <SettingsRow icon={Bell} label="Notifications" />
          <SettingsRow icon={Globe} label="Language" value="English" />
          <LogoutButton />
        </SettingsList>
      </div>
    </div>
  );
}
