import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import FeedScreen from "@/components/feed/FeedScreen";
import { withSlugs } from "@/components/feed/feedData";
import { getForYouFeed, type FeedItem } from "@/lib/api";

type Props = { params: Promise<{ slug?: string[] }> };

/**
 * Per-card metadata for shared deep-links (`/feed/why-it-matters`): link
 * previews show the card's heading + studybook instead of the generic feed
 * title. Unknown slugs fall back to the generic metadata — the feed itself
 * handles them by starting at the first card.
 */
/**
 * Pages scanned looking for a shared card's slug. A card slug is only derivable
 * from the card's heading (see feedData.withSlugs), so there's no direct lookup
 * to call — we walk the feed until it resolves, and cap the walk so an unknown
 * slug can't page the whole catalogue on every request.
 * TODO(team): ask TT for a card-by-slug endpoint and replace this scan.
 */
const METADATA_SCAN_PAGES = 5;
/** Studybooks per scanned page (each flattens into its cards). */
const METADATA_SCAN_BOOKS = 24;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations("app_app_feed_slug_page");
  const fallback: Metadata = {
    title: t("fallbackTitle"),
    description: t("fallbackDescription"),
  };
  const { slug } = await params;
  const active = slug?.[0];
  if (!active) return fallback;

  const seen: FeedItem[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < METADATA_SCAN_PAGES; i++) {
    const page = await getForYouFeed(cursor, METADATA_SCAN_BOOKS);
    seen.push(...page.items);
    const hit = withSlugs(seen).find((c) => c.slug === active);
    if (hit) {
      return {
        title: t("cardTitle", { title: hit.title, book: hit.bookTitle }),
        description: hit.description.slice(0, 160),
      };
    }
    if (!page.nextCursor) break;
    cursor = page.nextCursor;
  }
  return fallback;
}

export default function FeedPage() {
  // The active card comes from the URL — FeedScreen reads the pathname on
  // mount and keeps it in sync client-side as the user swipes.
  return <FeedScreen />;
}
