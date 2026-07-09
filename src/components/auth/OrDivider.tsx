"use client";

import { useTranslations } from "@/i18n/client";

/** "— or —" divider used between the primary form and social sign-in. */
export function OrDivider() {
  const t = useTranslations("components_auth_OrDivider");
  return (
    <div className="text-muted my-5 flex items-center gap-3 text-xs">
      <span className="bg-hairline h-px flex-1" /> {t("or")}{" "}
      <span className="bg-hairline h-px flex-1" />
    </div>
  );
}