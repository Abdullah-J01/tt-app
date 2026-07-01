import type { Metadata } from "next";
import { Flame, Settings, Bell, Globe, CreditCard, LogOut } from "lucide-react";

export const metadata: Metadata = { title: "Profile" };

const STATS = [
  { label: "Cards learned", value: "128" },
  { label: "Day streak", value: "5" },
  { label: "Studybooks", value: "3" },
];

const SETTINGS = [
  { icon: Bell, label: "Notifications" },
  { icon: Globe, label: "Language" },
  { icon: CreditCard, label: "Premium" },
  { icon: Settings, label: "Account settings" },
  { icon: LogOut, label: "Log out" },
];

/** Profile + streak/stats (UI brief §6.7). Static placeholder data. */
export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24 md:py-10 md:pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-lavender" />
        <div>
          <h1 className="text-xl font-bold">Your Name</h1>
          <p className="flex items-center gap-1 text-sm text-muted">
            <Flame className="h-4 w-4 text-amber" /> 5-day streak
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-card border border-hairline bg-surface p-4 text-center"
          >
            <p className="text-2xl font-bold text-violet">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Settings list */}
      <ul className="mt-8 divide-y divide-hairline overflow-hidden rounded-card border border-hairline">
        {SETTINGS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <button className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-lavender/50">
                <Icon className="h-5 w-5 text-muted" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
