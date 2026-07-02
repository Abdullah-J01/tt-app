import type { Metadata } from "next";
import { ExploreView, getCatalog } from "@/features/explore";

export const metadata: Metadata = { title: "Explore" };

/**
 * Catalog / browse (UI brief §6.4). TT-style three-panel catalog: faceted
 * filters, subject rail and tabbed studybook/studybite results. Data is
 * fetched here; all interactivity lives in <ExploreView> (client).
 */
export default async function ExplorePage() {
  const { books, studybites } = await getCatalog();

  return <ExploreView books={books} studybites={studybites} />;
}
