import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { AuthCard } from "@/components/auth/AuthCard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_auth_login_page");
  return { title: t("title") };
}

/** Log in (UI brief §6.2). Shares a flip card with sign-up. */
export default function LoginPage() {
  return <AuthCard initialMode="login" />;
}
