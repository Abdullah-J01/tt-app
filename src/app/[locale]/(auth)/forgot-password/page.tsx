import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { AuthCard } from "@/components/auth/AuthCard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_auth_forgot_password_page");
  return { title: t("title") };
}

/** Forgot / reset password (UI brief §6.2). Shares the flip card with log-in and sign-up. */
export default function ForgotPasswordPage() {
  return <AuthCard initialMode="forgot" />;
}
