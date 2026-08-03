import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import MarketingLandingPage from "@/components/home/page";

/**
 * `/` route. Auth-aware: a signed-in visitor has already "entered the
 * territory", so the marketing pitch is noise — send them straight to Home.
 * Signed-out visitors get the marketing page unchanged.
 */
export default async function RootPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/home");
  return <MarketingLandingPage />;
}
