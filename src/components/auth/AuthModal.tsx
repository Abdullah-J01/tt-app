"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/client";
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
  const { open, mode, backOnClose, reason, closeAuth } = useAuthModal();
  const router = useRouter();
  const t = useTranslations("components_auth_AuthModal");
  useScrollLock(open);

  // When opened as a hard gate (e.g. from explore), dismissing goes back.
  const handleClose = () => {
    closeAuth();
    if (backOnClose) router.back();
  };

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          // Scrollable overlay: when the on-screen keyboard shrinks the viewport
          // the card scrolls instead of clipping (focused inputs stay reachable).
          <div className="fixed inset-0 z-[80] flex overflow-y-auto overscroll-contain p-4">
            {/* Dimmed backdrop over the live page behind it. Solid tint on
                mobile — backdrop-blur repaints unreliably in the Android
                WebView when the keyboard resizes the viewport (flashes white). */}
            <motion.button
              type="button"
              aria-label={t("close")}
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-ink/60 md:bg-ink/50 fixed inset-0 md:backdrop-blur-md"
            />

            {/* Card — its own hover ✕ closes the modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="relative m-auto w-full max-w-[420px]"
            >
              {reason && (
                <p className="text-ink shadow-lift mb-3 rounded-xl bg-white/90 px-4 py-2.5 text-center text-sm font-medium backdrop-blur">
                  {reason}
                </p>
              )}
              <AuthCard initialMode={mode} syncUrl={false} onClose={handleClose} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
