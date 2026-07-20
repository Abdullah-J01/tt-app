"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuthGuard } from "@/components/auth/useAuthGuard";
import { useTranslations } from "@/i18n/client";
import { useCurrentLocale, localizeHref } from "@/i18n/Link";

/**
 * "Start learning" CTA. Signed-in users go straight to the reader. For paid
 * books, guests get the login popup instead. For free books, guests are let into
 * the reader too — it shows the first few cards and only then asks them to log in
 * (see FREE_PREVIEW_CARDS). Used on the studybook detail page and in the preview.
 */
export function StartLearningButton({
  slug,
  free = false,
  className,
  children,
}: {
  slug: string;
  free?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const { requireAuth } = useAuthGuard();
  const t = useTranslations("components_feed_ActionRail");

  const start = () => router.push(localizeHref(`/studybook/${slug}/read`, locale));

  return (
    <button
      type="button"
      onClick={() => (free ? start() : requireAuth(start, t("loginToLearn")))}
      className={className}
    >
      {children}
    </button>
  );
}
