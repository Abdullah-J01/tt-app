"use client";

import { useTranslations } from "@/i18n/client";
import { signOut } from "next-auth/react";
import Link from "@/i18n/Link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SETTINGS_GROUPS, type SettingsItem } from "../config";
import { SITE } from "@/config/site";
import { Button } from "@/components/ui/Button";

/** Grouped settings list. Links navigate; sign-out / delete run client actions. */
export function SettingsList() {
  const t = useTranslations("features_profile_components_SettingsList");
  const router = useRouter();

  const runAction = (id: string) => {
    if (id === "sign-out") {
      signOut({ callbackUrl: "/login" });
    } else if (id === "delete") {
      if (window.confirm(t("deleteConfirm"))) {
        router.push("/login");
      }
    }
  };

  return (
    <div className="space-y-6">
      {SETTINGS_GROUPS.map((group, gi) => (
        <section key={group.titleKey ?? `group-${gi}`}>
          {group.titleKey && (
            <h2 className="text-muted px-1 pb-1 text-xs font-bold tracking-wide uppercase">
              {t(group.titleKey)}
            </h2>
          )}
          <ul className="divide-hairline rounded-card border-hairline bg-surface divide-y overflow-hidden border">
            {group.items.map((item) =>
              item.href ? (
                <li key={item.id}>
                  <Link href={item.href} className="block">
                    <Row item={item} />
                  </Link>
                </li>
              ) : (
                <li key={item.id}>
                  <Button
                    unstyled
                    type="button"
                    onClick={() => runAction(item.id)}
                    className="w-full"
                  >
                    <Row item={item} />
                  </Button>
                </li>
              ),
            )}
          </ul>
        </section>
      ))}

      <p className="text-muted pt-2 text-center text-sm">{SITE.name} v0.1.0</p>
    </div>
  );
}

function Row({ item }: { item: SettingsItem }) {
  const t = useTranslations("features_profile_components_SettingsList");
  const Icon = item.icon;
  return (
    <span
      className={cn(
        "hover:bg-lavender/40 flex items-center gap-3 px-4 py-3.5 text-left transition-colors",
        item.danger ? "text-red-600" : "text-ink",
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", item.danger ? "text-red-600" : "text-ink")} />
      <span className="flex-1 font-medium">{t(item.labelKey, item.labelParams)}</span>
      {item.href && <ChevronRight className="text-muted h-5 w-5 shrink-0" />}
    </span>
  );
}
