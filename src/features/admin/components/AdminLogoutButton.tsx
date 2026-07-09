"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { Button } from "@/components/ui/Button";

/** Topbar log-out — client wrapper so `AdminTopbar` can stay server-rendered. */
export function AdminLogoutButton() {
  const t = useTranslations("features_admin_components_AdminLogoutButton");
  return (
    <Button
      unstyled
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-muted hover:bg-danger-tint hover:text-danger flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors"
    >
      <LogOut className="h-3.5 w-3.5" aria-hidden />
      {t("logout")}
    </Button>
  );
}
