"use client";

import { useEffect, type ReactNode } from "react";
import { useScrollLock } from "@/lib/useScrollLock";
import { Portal } from "@/lib/Portal";

interface StreakInfoSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  cta?: string;
}

export function StreakInfoSheet({ open, onClose, title, children, cta = "Continue" }: StreakInfoSheetProps) {
  useScrollLock(open);

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
      className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="fade-in absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="drawer-up bg-surface relative flex max-h-[88vh] w-full flex-col rounded-t-2xl md:max-w-md md:rounded-2xl">
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pt-7 pb-5">
          <h2 className="font-display text-ink text-2xl font-bold">{title}</h2>
          <div className="mt-5">{children}</div>
        </div>
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-ink hover:bg-ink/90 w-full rounded-full py-3.5 font-semibold text-white transition-transform active:scale-[0.98]"
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
    </Portal>
  );
}
