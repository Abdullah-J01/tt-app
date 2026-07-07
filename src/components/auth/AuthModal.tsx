"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Portal } from "@/lib/Portal";
import { useScrollLock } from "@/lib/useScrollLock";
import { AuthCard } from "./AuthCard";
import { useAuthModal } from "./useAuthModal";

/**
 * Global auth dialog — overlays the login / sign-up card on the current page,
 * dimmed and blurred behind (the same treatment as the studybook preview), so
 * signing in never makes the user lose their place. The /login route still
 * exists as a full page for direct links and guard redirects.
 */
export function AuthModal() {
  const { open, mode, closeAuth } = useAuthModal();
  useScrollLock(open);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80] grid place-items-center p-4">
            {/* Dimmed + blurred backdrop over the live page behind it */}
            <motion.button
              type="button"
              aria-label="Close"
              onClick={closeAuth}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-ink/50 absolute inset-0 backdrop-blur-md"
            />

            {/* Card — its own hover ✕ closes the modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="w-full max-w-[420px]"
            >
              <AuthCard initialMode={mode} syncUrl={false} onClose={closeAuth} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
