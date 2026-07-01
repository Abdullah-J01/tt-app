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
  grade: "Grade 7",
  plan: "Free plan",
  subscription: "Pro",
};

export interface SettingsItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Internal route or external URL. Omit for JS actions (sign out, delete). */
  href?: string;
  danger?: boolean;
}

export interface SettingsGroup {
  title?: string;
  items: SettingsItem[];
}

/** A settings row's destination — every internal row opens /profile/settings/<id>. */
const detail = (id: string) => `/profile/settings/${id}`;

/** Settings screen groups (mirrors the reference profile settings). */
export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    title: "Subscription",
    items: [
      { id: "subscription", label: `My subscription: ${PROFILE.subscription}`, icon: Shield, href: detail("subscription") },
    ],
  },
  {
    title: "Content",
    items: [
      { id: "followed", label: "Followed Topics", icon: Hash, href: detail("followed") },
      { id: "notifications", label: "Notifications", icon: Bell, href: detail("notifications") },
      { id: "email", label: "Email Subscriptions", icon: Mail, href: detail("email") },
    ],
  },
  {
    title: "Account",
    items: [
      { id: "personal", label: "Personal Information", icon: User, href: detail("personal") },
      { id: "preferences", label: "App Preferences", icon: SlidersHorizontal, href: detail("preferences") },
      { id: "app-icon", label: "App Icon", icon: ImageIcon, href: detail("app-icon") },
    ],
  },
  {
    title: "Support",
    items: [
      { id: "rate", label: "Rate Us", icon: Star, href: detail("rate") },
      { id: "invite", label: "Invite Friends", icon: UserPlus, href: "/profile/invite" },
      { id: "contact", label: "Contact Us", icon: Smartphone, href: detail("contact") },
      { id: "help", label: "Help Center", icon: HelpCircle, href: detail("help") },
    ],
  },
  {
    title: "Legal",
    items: [
      { id: "tos", label: "Terms Of Service", icon: FileText, href: detail("tos") },
      { id: "privacy", label: "Privacy Policy", icon: Lock, href: detail("privacy") },
    ],
  },
  {
    items: [
      { id: "sign-out", label: "Sign Out", icon: LogOut },
      { id: "delete", label: "Delete Account", icon: UserX, danger: true },
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
