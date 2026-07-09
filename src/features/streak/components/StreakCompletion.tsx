"use client";

import { useEffect } from "react";
import { useTranslations } from "@/i18n/client";
import { BookmarkCheck, X } from "lucide-react";
import { useStreak } from "../useStreak";
import { StreakFlame } from "./StreakFlame";
import { useScrollLock } from "@/lib/useScrollLock";
import { Portal } from "@/lib/Portal";

interface StreakCompletionProps {
  open: boolean;
  onClose: () => void;
  cardsLearned?: number;
  onSaveAll?: () => void;
  onNextStudybook?: () => void;
  onBackToFeed?: () => void;
}

export function StreakCompletion({
  open,
  onClose,
  cardsLearned,
  onSaveAll,
  onNextStudybook,
  onBackToFeed,
}: StreakCompletionProps) {
  const t = useTranslations("features_streak_components_StreakCompletion");
  const { markToday, streak } = useStreak();

  useScrollLock(open);

  useEffect(() => {
    if (open) markToday();
  }, [open, markToday]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Portal>
    <div
      className="fixed inset-0 z-[80] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("dialogLabel")}
    >
      <div className="fade-in absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="anim-pop bg-plum-gradient relative flex w-full max-w-sm flex-col items-center rounded-3xl px-6 py-9 text-center text-white shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 active:scale-90"
        >
          <X className="h-5 w-5" />
        </button>

        <StreakFlame size={80} />

        <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-white/55 uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="font-display mt-2 text-3xl leading-tight font-bold text-white">
          {t("heading", { count: cardsLearned ?? 0 })}
        </h1>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold">
            {t("streakBadge", { streak })}
          </span>
          {cardsLearned != null && (
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold">
              {t("cardsBadge", { count: cardsLearned })}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onSaveAll ?? onClose}
          className="text-violet-dark mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 font-semibold transition-transform active:scale-[0.98]"
        >
          <BookmarkCheck className="h-5 w-5" />
          {t("saveAll")}
        </button>
        <button
          type="button"
          onClick={onNextStudybook ?? onClose}
          className="mt-3 w-full rounded-full bg-white/10 py-3.5 font-semibold transition-transform hover:bg-white/15 active:scale-[0.98]"
        >
          {t("nextStudybook")}
        </button>
        <button
          type="button"
          onClick={onBackToFeed ?? onClose}
          className="mt-4 py-1 text-sm font-semibold text-white/80 transition-colors hover:text-white"
        >
          {t("backToFeed")}
        </button>
      </div>
    </div>
    </Portal>
  );
}
