"use client";

import { X } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { Logo } from "@/components/layout/Logo";

/** Top row of the auth card — brand logo on the left, close ✕ on the right. */
export function AuthHeader({ onClose }: { onClose: () => void }) {
  const t = useTranslations("components_auth_AuthHeader");
  return (
    <div className="mb-4 flex items-center justify-between">
      <Logo className="h-7" />
      <button
        type="button"
        onClick={onClose}
        aria-label={t("close")}
        className="text-ink/50 hover:bg-ink/5 hover:text-ink grid h-8 w-8 place-items-center rounded-full transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
