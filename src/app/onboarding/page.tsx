import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_onboarding_page");
  return { title: t("metaTitle") };
}

/** Onboarding: grade → interests → daily goal (UI brief §6.1). */
export default function OnboardingPage() {
  return (
    <main className="min-h-[100svh] bg-surface">
      <OnboardingFlow />
    </main>
  );
}
