import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = { title: "Log in" };

/** Log in (UI brief §6.2). Shares a flip card with sign-up. */
export default function LoginPage() {
  return <AuthCard initialMode="login" />;
}
