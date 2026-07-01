import type { ReactNode } from "react";

/** Grouped, hairline-divided container for `SettingsRow`s (UI brief §6.7). */
export function SettingsList({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline">
      {children}
    </div>
  );
}
