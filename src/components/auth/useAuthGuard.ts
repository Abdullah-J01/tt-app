"use client";

import { useAppSelector } from "@/store/hooks";
import { useAuthModal } from "./useAuthModal";

/**
 * Gate an action behind login. `requireAuth(fn)` runs `fn` when the user is
 * signed in; otherwise it opens the login popup and returns false. Auth state is
 * read from the Redux auth slice (kept in sync with the NextAuth session).
 */
export function useAuthGuard() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const status = useAppSelector((s) => s.auth.status);
  const openAuth = useAuthModal((s) => s.openAuth);

  const requireAuth = (fn: () => void, reason?: string): boolean => {
    if (status === "loading") return false; // still resolving — ignore the tap
    if (isAuthenticated) {
      fn();
      return true;
    }
    openAuth("login", reason ? { reason } : undefined);
    return false;
  };

  return { isAuthenticated, status, requireAuth };
}
