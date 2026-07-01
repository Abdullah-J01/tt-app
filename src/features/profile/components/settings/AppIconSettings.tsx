"use client";

import { useState } from "react";
import { Check, Flame, GraduationCap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = [
  {
    id: "default",
    label: "Default",
    desc: "Our latest icon design",
    icon: GraduationCap,
    gradient: "from-brand-green to-violet",
    locked: false,
  },
  {
    id: "streak",
    label: "On Fire!",
    desc: "Unlocked with a 7-day streak",
    icon: Flame,
    gradient: "from-amber to-red-500",
    locked: true,
  },
  {
    id: "pro",
    label: "Feel like a Pro",
    desc: "Unlocked with a Pro subscription",
    icon: Flame,
    gradient: "from-violet to-plum-1",
    locked: false,
  },
];

export function AppIconSettings() {
  const [selected, setSelected] = useState("default");

  return (
    <div className="divide-y divide-hairline border-y border-hairline">
      {ICONS.map((ic) => {
        const Icon = ic.icon;
        const isSel = selected === ic.id;
        return (
          <button
            key={ic.id}
            type="button"
            disabled={ic.locked}
            onClick={() => setSelected(ic.id)}
            className="flex w-full items-center gap-4 py-4 text-left disabled:opacity-60"
          >
            <span
              className={cn(
                "grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-soft",
                ic.gradient,
              )}
            >
              <Icon className="h-7 w-7" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-ink">{ic.label}</span>
              <span className="block text-sm text-muted">{ic.desc}</span>
            </span>
            {ic.locked ? (
              <Lock className="h-5 w-5 text-muted" />
            ) : isSel ? (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-green text-white">
                <Check className="h-4 w-4" />
              </span>
            ) : (
              <span className="h-6 w-6 rounded-full border-2 border-hairline" />
            )}
          </button>
        );
      })}
    </div>
  );
}
