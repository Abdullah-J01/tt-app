"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuthGuard } from "@/components/auth/useAuthGuard";
import { useTranslations } from "@/i18n/client";
import { useCurrentLocale, localizeHref } from "@/i18n/Link";

/**
 * "Start learning" CTA gated behind login. Signed-in users go straight to the
 * reader; guests get the login popup instead (the actual block the product
 * wants). Used on the studybook detail page and in the preview.
 */
export function StartLearningButton({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const { requireAuth } = useAuthGuard();
  const t = useTranslations("components_feed_ActionRail");

  const start = () => router.push(localizeHref(`/studybook/${slug}/read`, locale));

  return (
    <button type="button" onClick={() => requireAuth(start, t("loginToLearn"))} className={className}>
      {children}
    </button>
  );
}
