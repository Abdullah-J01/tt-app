import { AppChrome } from "@/components/layout/AppChrome";

/**
 * Shell for the main app (feed, explore, library, profile). These pages are
 * publicly browsable — signed-out visitors can look around; individual actions
 * (save, like, start learning) prompt for login, and pages that need an account
 * (library, profile) show an in-page sign-in message. The path-dependent chrome
 * (hide Navbar/Footer on the immersive feed) lives in the AppChrome client
 * component.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppChrome>{children}</AppChrome>;
}
