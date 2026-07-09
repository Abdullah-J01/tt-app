import { create } from "zustand";

type Mode = "login" | "signup";

interface OpenOptions {
  /** When the dialog is dismissed, go back in history (e.g. return to explore). */
  backOnClose?: boolean;
  /** Optional message shown above the card (e.g. "Log in to start learning"). */
  reason?: string;
}

interface AuthModalState {
  open: boolean;
  mode: Mode;
  backOnClose: boolean;
  reason?: string;
  /** Open the auth dialog over the current page (defaults to log in). */
  openAuth: (mode?: Mode, opts?: OpenOptions) => void;
  closeAuth: () => void;
}

/**
 * Controls the global auth dialog. Opening it overlays the login/sign-up card on
 * the current page (dimmed + blurred behind) instead of navigating to /login —
 * so the user keeps their context. The /login route still exists as a full page
 * for direct links and guard redirects.
 */
export const useAuthModal = create<AuthModalState>((set) => ({
  open: false,
  mode: "login",
  backOnClose: false,
  reason: undefined,
  openAuth: (mode = "login", opts) =>
    set({ open: true, mode, backOnClose: opts?.backOnClose ?? false, reason: opts?.reason }),
  closeAuth: () => set({ open: false, backOnClose: false, reason: undefined }),
}));
