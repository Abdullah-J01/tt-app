"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuthGuard } from "@/components/auth/useAuthGuard";
import { useTranslations } from "@/i18n/client";
import { useCurrentLocale, localizeHref } from "@/i18n/Link";
import { chapterParam } from "@/lib/chapters";

/**
 * "Start learning" CTA. Signed-in users go straight to the reader. For paid
 * books, guests get the login popup instead. For free books, guests are let into
 * the reader too — it shows the first few cards and only then asks them to log in
 * (see FREE_PREVIEW_CARDS). Used on the studybook detail page and in the preview.
 *
 * `chapter` (0-based) opens the reader on that chapter — this is what the detail
 * page's chapter tiles use, so opening a chapter goes through the same paywall
 * as the main CTA rather than around it.
 */
export function StartLearningButton({
  slug,
  chapter,
  free = false,
  className,
  children,
}: {
  slug: string;
  chapter?: number;
  free?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const { requireAuth } = useAuthGuard();
  const t = useTranslations("components_feed_ActionRail");

  const query = chapter != null ? `?chapter=${chapterParam(chapter)}` : "";
  const start = () => router.push(localizeHref(`/studybook/${slug}/read${query}`, locale));

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
