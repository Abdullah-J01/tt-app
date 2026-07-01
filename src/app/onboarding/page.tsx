import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export const metadata: Metadata = { title: "Get started" };

/** Onboarding: grade → interests → daily goal (UI brief §6.1). */
export default function OnboardingPage() {
  return (
    <main className="min-h-[100svh] bg-surface">
      <OnboardingFlow />
    </main>
  );
}
