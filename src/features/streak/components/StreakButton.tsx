"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n/client";
import { Flame } from "lucide-react";
import { useStreak } from "../useStreak";
import { StreakPanel } from "./StreakPanel";

export function StreakButton() {
  const t = useTranslations("features_streak_components_StreakButton");
  const [open, setOpen] = useState(false);
  const { streak } = useStreak();
  const lit = streak > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("ariaLabel", { count: streak })}
        aria-haspopup="dialog"
        className="text-ink/80 hover:text-ink inline-flex items-center gap-1 text-sm font-semibold leading-none transition-colors active:scale-95"
      >
        <Flame
          size={18}
          className={lit ? "text-amber" : "text-faint"}
          fill={lit ? "currentColor" : "none"}
        />
        <span className={lit ? "text-ink" : "text-muted"}>{streak}</span>
      </button>

      <StreakPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
