import type { Metadata } from "next";
import { CardFeed } from "@/components/feed/CardFeed";
import { getForYouFeed } from "@/lib/api";

export const metadata: Metadata = { title: "Home" };

/**
 * "For You" vertical card feed — the core screen (UI brief §4).
 * Data comes from the TT backend via the app data layer (mock fallback in dev).
 */
export default async function FeedPage() {
  const items = await getForYouFeed();

  return (
    <div className="mx-auto -mt-20 max-w-md md:-mt-24 md:max-w-lg">
      <CardFeed items={items} />
    </div>
  );
}
