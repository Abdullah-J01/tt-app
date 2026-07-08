import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { AuthCard } from "@/components/auth/AuthCard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_auth_signup_page");
  return { title: t("title") };
}

/** Sign up (UI brief §6.2). Shares a flip card with log-in. */
export default function SignupPage() {
  return <AuthCard initialMode="signup" />;
}
