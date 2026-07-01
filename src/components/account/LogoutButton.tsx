"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { SettingsRow } from "./SettingsRow";

/** Log-out settings row — client wrapper so the static list can stay server-rendered. */
export function LogoutButton() {
  return (
    <SettingsRow
      icon={LogOut}
      label="Log out"
      danger
      onClick={() => signOut({ callbackUrl: "/" })}
    />
  );
}
