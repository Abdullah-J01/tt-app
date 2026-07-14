"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, LogIn, X } from "lucide-react";
import Link from "@/i18n/Link";
import { Button } from "@/components/ui/Button";
import { useAuthModal } from "@/components/auth/useAuthModal";
import type { BillingError } from "./core";

const easeOut = [0.22, 1, 0.36, 1] as const;

/**
 * Themed error dialog for billing/Stripe failures, styled to match the
 * pricing cards (rounded-3xl surface, violet accents). Pass the caught
 * {@link BillingError} to open it; `null` keeps it closed.
 *
 * When the error is an auth error (the user isn't signed in) it shows a
 * "Sign in" call to action instead of a retry, since retrying without an
 * account would just fail again.
 */
export function BillingErrorModal({
  error,
  onClose,
  onRetry,
}: {
  error: BillingError | null;
  onClose: () => void;
  /** Optional — shown as a "Try again" button for non-auth errors. */
  onRetry?: () => void;
}) {
  const isAuth = error?.isAuthError ?? false;
  const openAuth = useAuthModal((s) => s.openAuth);

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="billing-error-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.28, ease: easeOut }}
            className="bg-surface relative w-full max-w-sm overflow-hidden rounded-t-3xl p-6 shadow-xl ring-1 ring-black/5 sm:rounded-3xl"
          >
            <Button
              unstyled
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="hover:bg-lavender text-muted absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>

            <span
              className={
                isAuth
                  ? "bg-lavender text-violet mx-auto grid h-14 w-14 place-items-center rounded-full"
                  : "mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600"
              }
            >
              {isAuth ? <LogIn className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
            </span>

            <h2 id="billing-error-title" className="text-ink mt-4 text-center text-xl font-bold">
              {isAuth ? "Sign in to continue" : "Something went wrong"}
            </h2>
            <p className="text-muted mt-2 text-center text-sm">
              {isAuth
                ? "You need to be signed in before you can start a subscription."
                : error.message}
            </p>

            <div className="mt-6 flex flex-col gap-2">
              {isAuth ? (
                <>
                  <Button
                    onClick={() => openAuth("signup")}

                    className="bg-violet hover:bg-violet-dark flex h-11 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white transition-colors"
                  >
                    Sign in
                  </Button>

                  <Button variant="secondary" block onClick={onClose}>
                    Not now
                  </Button>
                </>
              ) : (
                <>
                  {onRetry && (
                    <Button
                      block
                      onClick={() => {
                        onClose();
                        onRetry();
                      }}
                    >
                      Try again
                    </Button>
                  )}
                  <Button variant="secondary" block onClick={onClose}>
                    Close
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
