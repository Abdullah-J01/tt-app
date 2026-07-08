"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "@/i18n/client";
import { LogOut } from "lucide-react";
import { SettingsRow } from "./SettingsRow";

/** Log-out settings row — client wrapper so the static list can stay server-rendered. */
export function LogoutButton() {
  const t = useTranslations("components_account_LogoutButton");
  return (
    <SettingsRow
      icon={LogOut}
      label={t("logOut")}
      danger
      onClick={() => signOut({ callbackUrl: "/" })}
    />
  );
}
