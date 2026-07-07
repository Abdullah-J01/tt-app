/**
 * Shared shell for the auth screens (log in, sign up, forgot password). The card
 * floats over a dimmed, blurred backdrop — the same modal treatment used behind
 * the studybook preview — so it reads as a focused dialog. post-login carries no
 * UI (it just redirects), so this shell is harmless there.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-lavender-soft grid min-h-[100svh] place-items-center px-5 py-6">
      {children}
    </main>
  );
}
