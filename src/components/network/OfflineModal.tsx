"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Portal } from "@/lib/Portal";
import { useScrollLock } from "@/lib/useScrollLock";

interface OfflineModalProps {
  open: boolean;
  isReconnecting: boolean;
  onRetry: () => void;
  onClose: () => void;
}

/**
 * Offline modal shown when the user tries to reach an uncached page while
 * offline. Matches the app's dialog treatment (dimmed + blurred backdrop, spring
 * card, violet accent, Poppins display font). Closes automatically when the
 * connection returns — the parent unmounts it via `open`.
 */
export function OfflineModal({ open, isReconnecting, onRetry, onClose }: OfflineModalProps) {
  const titleId = useId();
  const descId = useId();
  const retryRef = useRef<HTMLButtonElement>(null);

  useScrollLock(open);

  // Focus the primary action on open; close on Escape.
  useEffect(() => {
    if (!open) return;
    retryRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="fixed inset-0 z-[90] grid place-items-center p-4"
          >
            {/* Dimmed + blurred backdrop */}
            <motion.button
              type="button"
              aria-label="Close"
              tabIndex={-1}
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-ink/50 absolute inset-0 backdrop-blur-md"
            />

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="shadow-lift bg-surface relative w-full max-w-[380px] rounded-3xl p-7 text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 18 }}
                className="bg-violet-tint mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl"
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-violet)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 2l20 20" />
                  <path d="M8.5 16.5a5 5 0 0 1 7 0" />
                  <path d="M5 12.5a10 10 0 0 1 5.5-2.8" />
                  <path d="M2 8.8a15 15 0 0 1 4.2-2.5" />
                  <path d="M22 8.8a15 15 0 0 0-6.4-3.4" />
                  <path d="M19 12.5a10 10 0 0 0-2.5-1.8" />
                  <path d="M12 20h.01" />
                </svg>
              </motion.div>

              <h2 id={titleId} className="font-display text-ink text-xl font-semibold">
                No Internet Connection
              </h2>
              <p id={descId} className="text-muted mt-2 text-sm leading-relaxed">
                You&rsquo;re currently offline. Reconnect and try again.
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  ref={retryRef}
                  type="button"
                  onClick={onRetry}
                  disabled={isReconnecting}
                  className="bg-violet hover:bg-violet-dark inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition-colors disabled:opacity-70"
                >
                  {isReconnecting && (
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      aria-hidden="true"
                    />
                  )}
                  {isReconnecting ? "Reconnecting…" : "Retry"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-muted hover:text-ink inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
