import type { Metadata } from "next";
import { ForgotPasswordCard } from "@/components/auth/ForgotPasswordCard";

export const metadata: Metadata = { title: "Reset password" };

/** Forgot / reset password (UI brief §6.2). */
export default function ForgotPasswordPage() {
  return <ForgotPasswordCard />;
}
