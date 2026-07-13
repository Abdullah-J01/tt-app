import {
  Bell,
  FileText,
  Hash,
  HelpCircle,
  Image as ImageIcon,
  Lock,
  LogOut,
  Mail,
  Shield,
  SlidersHorizontal,
  Smartphone,
  Star,
  User,
  UserPlus,
  UserX,
  type LucideIcon,
} from "lucide-react";

/** Current user (placeholder). TODO(team): hydrate from the session / TT profile. */
export const PROFILE = {
  firstName: "Rohab",
  lastName: "Khan",
  name: "Rohab Khan",
  handle: "rohabkhan",
  email: "rohab.khan19@gmail.com",
  grade: 7,
  plan: "Free plan",
  subscription: "Pro",
};

export interface SettingsItem {
  id: string;
  /** i18n key under `features_profile_components_SettingsList`. */
  labelKey: string;
  /** Interpolation values for `labelKey` (e.g. the subscription plan name). */
  labelParams?: Record<string, string>;
  icon: LucideIcon;
  /** Internal route or external URL. Omit for JS actions (sign out, delete). */
  href?: string;
  danger?: boolean;
}

export interface SettingsGroup {
  /** i18n key under `features_profile_components_SettingsList`. */
  titleKey?: string;
  items: SettingsItem[];
}

/** A settings row's destination — every internal row opens /profile/settings/<id>. */
const detail = (id: string) => `/profile/settings/${id}`;

/** Settings screen groups (mirrors the reference profile settings). */
export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    titleKey: "groupSubscription",
    items: [
      { id: "subscription", labelKey: "itemSubscription", labelParams: { plan: PROFILE.subscription }, icon: Shield, href: detail("subscription") },
    ],
  },
  {
    titleKey: "groupContent",
    items: [
      { id: "followed", labelKey: "itemFollowed", icon: Hash, href: detail("followed") },
      { id: "notifications", labelKey: "itemNotifications", icon: Bell, href: detail("notifications") },
      { id: "email", labelKey: "itemEmail", icon: Mail, href: detail("email") },
    ],
  },
  {
    titleKey: "groupAccount",
    items: [
      { id: "personal", labelKey: "itemPersonal", icon: User, href: detail("personal") },
      { id: "preferences", labelKey: "itemPreferences", icon: SlidersHorizontal, href: detail("preferences") },
      { id: "app-icon", labelKey: "itemAppIcon", icon: ImageIcon, href: detail("app-icon") },
    ],
  },
  {
    titleKey: "groupSupport",
    items: [
      { id: "rate", labelKey: "itemRate", icon: Star, href: detail("rate") },
      { id: "invite", labelKey: "itemInvite", icon: UserPlus, href: "/profile/invite" },
      { id: "contact", labelKey: "itemContact", icon: Smartphone, href: detail("contact") },
      { id: "help", labelKey: "itemHelp", icon: HelpCircle, href: detail("help") },
    ],
  },
  {
    titleKey: "groupLegal",
    items: [
      { id: "tos", labelKey: "itemTos", icon: FileText, href: detail("tos") },
      { id: "privacy", labelKey: "itemPrivacy", icon: Lock, href: detail("privacy") },
    ],
  },
  {
    items: [
      { id: "sign-out", labelKey: "itemSignOut", icon: LogOut },
      { id: "delete", labelKey: "itemDelete", icon: UserX, danger: true },
    ],
  },
];

/** Look up a settings item by id (used by the detail screen for its title). */
export function findSettingsItem(id: string): SettingsItem | undefined {
  for (const group of SETTINGS_GROUPS) {
    const found = group.items.find((i) => i.id === id);
    if (found) return found;
  }
  return undefined;
}
