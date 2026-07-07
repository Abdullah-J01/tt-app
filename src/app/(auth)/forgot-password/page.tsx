import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = { title: "Reset password" };

/** Forgot / reset password (UI brief §6.2). Shares the flip card with log-in and sign-up. */
export default function ForgotPasswordPage() {
  return <AuthCard initialMode="forgot" />;
}
