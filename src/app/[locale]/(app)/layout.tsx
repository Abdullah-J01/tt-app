import { requireUser } from "@/lib/auth";
import { AppChrome } from "@/components/layout/AppChrome";

/**
 * Shell for the authenticated app (feed, explore, library, profile). Server
 * component so it can gate the whole subtree: `requireUser()` sends signed-out
 * visitors to /login before any page renders. The path-dependent chrome (hide
 * Navbar/Footer on the immersive feed) lives in the AppChrome client component.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return <AppChrome>{children}</AppChrome>;
}
