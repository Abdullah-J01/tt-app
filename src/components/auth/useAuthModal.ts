import { create } from "zustand";

type Mode = "login" | "signup";

interface AuthModalState {
  open: boolean;
  mode: Mode;
  /** Open the auth dialog over the current page (defaults to log in). */
  openAuth: (mode?: Mode) => void;
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
  openAuth: (mode = "login") => set({ open: true, mode }),
  closeAuth: () => set({ open: false }),
}));
