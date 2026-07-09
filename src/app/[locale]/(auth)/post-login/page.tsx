import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

/**
 * Post-login gateway: the login form lands here when the user didn't arrive
 * via a guard bounce (no explicit ?callbackUrl=). Routes by session role —
 * admins go straight to the admin dashboard, everyone else to `?to=`
 * (the device-appropriate default the login page computed).
 */
export default async function PostLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role === "admin") redirect("/admin");

  const { to } = await searchParams;
  // Internal paths only — never redirect to another origin.
  const dest = to?.startsWith("/") && !to.startsWith("//") ? to : "/feed";
  redirect(dest);
}
