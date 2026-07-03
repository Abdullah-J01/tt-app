import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar, AdminTopbar } from "@/features/admin";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · StudyBooks" },
};

/**
 * Shell for the Admin CMS (UI brief §6.10): slim topbar + section sidebar.
 * `requireAdmin()` gates every nested route — unauthenticated users are sent to
 * /login, signed-in non-admins get a 404. Server actions re-check on their own.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="bg-lavender-soft min-h-[100svh]">
      <AdminTopbar userName={session.user.name} />
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 py-6 max-md:flex-col">
        <AdminSidebar />
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
