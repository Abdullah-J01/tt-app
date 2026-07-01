"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SETTINGS_GROUPS, type SettingsItem } from "../config";
import { SITE } from "@/config/site";

/** Grouped settings list. Links navigate; sign-out / delete run client actions. */
export function SettingsList() {
  const router = useRouter();

  const runAction = (id: string) => {
    if (id === "sign-out") {
      // TODO(team): call next-auth signOut() once the session provider is wired.
      router.push("/login");
    } else if (id === "delete") {
      if (window.confirm("Delete your account? This can't be undone.")) {
        router.push("/login");
      }
    }
  };

  return (
    <div className="space-y-6">
      {SETTINGS_GROUPS.map((group, gi) => (
        <section key={group.title ?? `group-${gi}`}>
          {group.title && (
            <h2 className="px-1 pb-1 text-xs font-bold uppercase tracking-wide text-muted">
              {group.title}
            </h2>
          )}
          <ul className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-surface">
            {group.items.map((item) =>
              item.href ? (
                <li key={item.id}>
                  <Link href={item.href} className="block">
                    <Row item={item} />
                  </Link>
                </li>
              ) : (
                <li key={item.id}>
                  <button type="button" onClick={() => runAction(item.id)} className="w-full">
                    <Row item={item} />
                  </button>
                </li>
              ),
            )}
          </ul>
        </section>
      ))}

      <p className="pt-2 text-center text-sm text-muted">
        {SITE.name} v0.1.0
      </p>
    </div>
  );
}

function Row({ item }: { item: SettingsItem }) {
  const Icon = item.icon;
  return (
    <span
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-lavender/40",
        item.danger ? "text-red-600" : "text-ink",
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", item.danger ? "text-red-600" : "text-ink")} />
      <span className="flex-1 font-medium">{item.label}</span>
      {item.href && <ChevronRight className="h-5 w-5 shrink-0 text-muted" />}
    </span>
  );
}
