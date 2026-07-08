import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/features/admin";
import Navbar from "@/components/layout/Navbar";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_admin_layout");
  return {
    title: { default: t("title"), template: t("titleTemplate") },
  };
}

/**
 * Shell for the Admin CMS (UI brief §6.10): the shared site header (Navbar) +
 * section sidebar — the same one header the whole app uses. `requireAdmin()`
 * gates every nested route — unauthenticated users are sent to /login, signed-in
 * non-admins get a 404. Server actions re-check on their own.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="bg-lavender-soft min-h-[100svh]">
      <Navbar />
      {/* pt clears the fixed shared header (same spacer idea as the app shell). */}
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 pt-24 pb-6 max-md:flex-col sm:px-6 md:pt-28 lg:px-8">
        <AdminSidebar />
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
