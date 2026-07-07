import Navbar from "@/components/layout/Navbar";
import { ResponsiveFooter } from "@/components/layout/ResponsiveFooter";

/**
 * Shared shell for the public marketing pages (home, about, contact, privacy,
 * terms). The header (Navbar) and Footer live here, so every page in this group
 * — and any new page added to it — gets them automatically without re-importing.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <ResponsiveFooter />
    </>
  );
}
