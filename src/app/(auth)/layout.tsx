import Navbar from "@/components/layout/Navbar";

/**
 * Shared shell for the auth screens (log in, sign up, forgot password). Carries
 * the same site header (Navbar) as everywhere else, over a centred, full-height
 * lavender canvas — each page only renders its card. post-login carries no UI
 * (it just redirects), so this shell is harmless there.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="bg-surface grid min-h-[100svh] place-items-center px-5 py-6">
        {children}
      </main>
    </>
  );
}
