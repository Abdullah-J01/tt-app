import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = { title: "Sign up" };

/** Sign up (UI brief §6.2). Shares a flip card with log-in. */
export default function SignupPage() {
  return <AuthCard initialMode="signup" />;
}
