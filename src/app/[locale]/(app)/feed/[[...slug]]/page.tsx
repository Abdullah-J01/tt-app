import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import FeedScreen from "@/components/feed/FeedScreen";
import { withSlugs } from "@/components/feed/feedData";
import { getForYouFeed } from "@/lib/api";

type Props = { params: Promise<{ slug?: string[] }> };

/**
 * Per-card metadata for shared deep-links (`/feed/why-it-matters`): link
 * previews show the card's heading + studybook instead of the generic feed
 * title. Unknown slugs fall back to the generic metadata — the feed itself
 * handles them by starting at the first card.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations("app_app_feed_slug_page");
  const fallback: Metadata = {
    title: t("fallbackTitle"),
    description: t("fallbackDescription"),
  };
  const { slug } = await params;
  const active = slug?.[0];
  if (!active) return fallback;
  const card = withSlugs(await getForYouFeed()).find((c) => c.slug === active);
  if (!card) return fallback;
  return {
    title: t("cardTitle", { title: card.title, book: card.bookTitle }),
    description: card.description.slice(0, 160),
  };
}

export default function FeedPage() {
  // The active card comes from the URL — FeedScreen reads the pathname on
  // mount and keeps it in sync client-side as the user swipes.
  return <FeedScreen />;
}
