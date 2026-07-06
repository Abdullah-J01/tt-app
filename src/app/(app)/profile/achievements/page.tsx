import type { Metadata } from "next";
import { AchievementsView } from "@/features/achievements";

export const metadata: Metadata = { title: "Achievements" };

export default function AchievementsPage() {
  return <AchievementsView />;
}
