import { Construction } from "lucide-react";
import { getTranslations } from "@/i18n/server";
import { findSettingsItem } from "../../config";
import { NotificationsSettings } from "./NotificationsSettings";
import { EmailSettings } from "./EmailSettings";
import { FollowedTopics } from "./FollowedTopics";
import { PersonalInformation } from "./PersonalInformation";
import { AppPreferences } from "./AppPreferences";
import { AppIconSettings } from "./AppIconSettings";

/** Renders the right settings detail screen for a section id. */
export async function SettingsScreen({ section }: { section: string }) {
  const t = await getTranslations("features_profile_components_settings_SettingsScreen");
  switch (section) {
    case "notifications":
      return <NotificationsSettings />;
    case "email":
      return <EmailSettings />;
    case "followed":
      return <FollowedTopics />;
    case "personal":
      return <PersonalInformation />;
    case "preferences":
      return <AppPreferences />;
    case "app-icon":
      return <AppIconSettings />;
    default: {
      const item = findSettingsItem(section);
      const tList = await getTranslations("features_profile_components_SettingsList");
      const label = item ? tList(item.labelKey, item.labelParams) : t("settings");
      return <Placeholder label={label} />;
    }
  }
}

/** Not-yet-built sections (subscription, legal, help…) get a clear placeholder. */
async function Placeholder({ label }: { label: string }) {
  const t = await getTranslations("features_profile_components_settings_SettingsScreen");
  return (
    <div className="mt-10 flex flex-col items-center text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-lavender text-violet">
        <Construction className="h-8 w-8" />
      </span>
      <p className="mt-4 font-semibold">{t("comingSoon", { label })}</p>
      <p className="mt-1 max-w-xs text-sm text-muted">
        {t("placeholderBody")}
      </p>
    </div>
  );
}
