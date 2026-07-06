"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Heart, X } from "lucide-react";

type ToastAction = { label: string; onClick: () => void };
type ToastItem = { id: number; message: string; action?: ToastAction; icon?: ReactNode };

const DEFAULT_DURATION = 2000;

/* --- Tiny module-level store so any component can `toast(...)` without a provider --- */
let counter = 0;
let items: ToastItem[] = [];
const listeners = new Set<(items: ToastItem[]) => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function emit() {
  const snapshot = [...items];
  listeners.forEach((l) => l(snapshot));
}

function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  emit();
}

/** Queue a toast. Returns its id so callers can dismiss it early. */
export function toast(
  message: string,
  opts?: { action?: ToastAction; duration?: number; icon?: ReactNode },
) {
  const id = ++counter;
  items = [...items, { id, message, action: opts?.action, icon: opts?.icon }];
  emit();
  timers.set(
    id,
    setTimeout(() => dismiss(id), opts?.duration ?? DEFAULT_DURATION),
  );
  return id;
}

/** Confirmation toast with an Undo action that reverts the change. */
function toastUndo(message: string, icon: ReactNode, onUndo: () => void) {
  const id = toast(message, {
    icon,
    action: {
      label: "Undo",
      onClick: () => {
        onUndo();
        dismiss(id);
      },
    },
  });
}

/** The "Saved to Library" toast with an Undo that reverts the save. */
export function toastSaved(onUndo: () => void) {
  toastUndo(
    "Saved to Library",
    <Bookmark className="text-brand-green fill-brand-green h-4 w-4 shrink-0" />,
    onUndo,
  );
}

/** The "Added to Likes" toast with an Undo that reverts the like. */
export function toastLiked(onUndo: () => void) {
  toastUndo(
    "Added to Likes",
    <Heart className="h-4 w-4 shrink-0 fill-rose-500 text-rose-500" />,
    onUndo,
  );
}

/** Mounted once (in the root layout) — renders whatever is in the store. */
export function Toaster() {
  const [list, setList] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.add(setList);
    setList([...items]);
    return () => {
      listeners.delete(setList);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            role="status"
            aria-live="polite"
            className="shadow-lift bg-ink/95 pointer-events-auto flex items-center gap-3 rounded-xl py-2.5 pr-2 pl-4 text-sm text-white backdrop-blur"
          >
            {t.icon}
            <span className="font-medium">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={t.action.onClick}
                className="ml-2 font-semibold text-[#A78BFA] hover:underline"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
