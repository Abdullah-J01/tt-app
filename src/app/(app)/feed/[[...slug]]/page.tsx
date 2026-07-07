import type { Metadata } from "next";
import FeedScreen from "@/components/feed/FeedScreen";
import { withSlugs } from "@/components/feed/feedData";
import { getForYouFeed } from "@/lib/api";

type Props = { params: Promise<{ slug?: string[] }> };

const FALLBACK: Metadata = {
  title: "Feed — TaskuTark",
  description: "Swipe through bite-sized studybook cards, one insight at a time.",
};

/**
 * Per-card metadata for shared deep-links (`/feed/why-it-matters`): link
 * previews show the card's heading + studybook instead of the generic feed
 * title. Unknown slugs fall back to the generic metadata — the feed itself
 * handles them by starting at the first card.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const active = slug?.[0];
  if (!active) return FALLBACK;
  const card = withSlugs(await getForYouFeed()).find((c) => c.slug === active);
  if (!card) return FALLBACK;
  return {
    title: `${card.title} — ${card.bookTitle} | StudyBooks`,
    description: card.description.slice(0, 160),
  };
}

export default function FeedPage() {
  // The active card comes from the URL — FeedScreen reads the pathname on
  // mount and keeps it in sync client-side as the user swipes.
  return <FeedScreen />;
}
