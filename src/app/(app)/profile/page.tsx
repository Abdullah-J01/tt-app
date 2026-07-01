import type { Metadata } from "next";
import { ProfileView } from "@/features/profile";

export const metadata: Metadata = { title: "Profile" };

/** Profile home (UI brief §6.7). */
export default function ProfilePage() {
  return <ProfileView />;
}
