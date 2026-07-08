"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n/client";
import { Check, Flame, GraduationCap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const ICONS = [
  {
    id: "default",
    icon: GraduationCap,
    gradient: "from-brand-green to-violet",
    locked: false,
  },
  {
    id: "streak",
    icon: Flame,
    gradient: "from-amber to-red-500",
    locked: true,
  },
  {
    id: "pro",
    icon: Flame,
    gradient: "from-violet to-plum-1",
    locked: false,
  },
];

export function AppIconSettings() {
  const t = useTranslations("features_profile_components_settings_AppIconSettings");
  const [selected, setSelected] = useState("default");

  return (
    <div className="divide-hairline border-hairline divide-y border-y">
      {ICONS.map((ic) => {
        const Icon = ic.icon;
        const isSel = selected === ic.id;
        return (
          <Button
            unstyled
            key={ic.id}
            type="button"
            disabled={ic.locked}
            onClick={() => setSelected(ic.id)}
            className="flex w-full items-center gap-4 py-4 text-left disabled:opacity-60"
          >
            <span
              className={cn(
                "shadow-soft grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white",
                ic.gradient,
              )}
            >
              <Icon className="h-7 w-7" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-ink block font-bold">{t(`${ic.id}Label`)}</span>
              <span className="text-muted block text-sm">{t(`${ic.id}Desc`)}</span>
            </span>
            {ic.locked ? (
              <Lock className="text-muted h-5 w-5" />
            ) : isSel ? (
              <span className="bg-brand-green grid h-6 w-6 place-items-center rounded-full text-white">
                <Check className="h-4 w-4" />
              </span>
            ) : (
              <span className="border-hairline h-6 w-6 rounded-full border-2" />
            )}
          </Button>
        );
      })}
    </div>
  );
}
