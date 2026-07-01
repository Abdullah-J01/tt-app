import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";

/**
 * Shell for the authenticated app (feed, explore, library, profile).
 * Desktop shows the TT-style TopNav; mobile shows the BottomNav.
 *
 * TODO(team): gate this layout behind an auth check (redirect to /login).
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100svh] bg-surface">
      <div className="hidden md:block">
        <TopNav />
      </div>
      {children}
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
