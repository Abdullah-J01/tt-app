import { Construction } from "lucide-react";
import { findSettingsItem } from "../../config";
import { NotificationsSettings } from "./NotificationsSettings";
import { EmailSettings } from "./EmailSettings";
import { FollowedTopics } from "./FollowedTopics";
import { PersonalInformation } from "./PersonalInformation";
import { AppPreferences } from "./AppPreferences";
import { AppIconSettings } from "./AppIconSettings";

/** Renders the right settings detail screen for a section id. */
export function SettingsScreen({ section }: { section: string }) {
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
    default:
      return <Placeholder label={findSettingsItem(section)?.label ?? "Settings"} />;
  }
}

/** Not-yet-built sections (subscription, legal, help…) get a clear placeholder. */
function Placeholder({ label }: { label: string }) {
  return (
    <div className="mt-10 flex flex-col items-center text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-lavender text-violet">
        <Construction className="h-8 w-8" />
      </span>
      <p className="mt-4 font-semibold">{label} is coming soon</p>
      <p className="mt-1 max-w-xs text-sm text-muted">
        This screen will be wired up once the account &amp; TaskuTark APIs are connected.
      </p>
    </div>
  );
}
