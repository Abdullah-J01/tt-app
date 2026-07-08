import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { ExploreView, getCatalog } from "@/features/explore";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_app_explore_page");
  return { title: t("metadataTitle") };
}

/**
 * Catalog / browse (UI brief §6.4). TT-style three-panel catalog: faceted
 * filters, subject rail and tabbed studybook/studybite results. Data is
 * fetched here; all interactivity lives in <ExploreView> (client).
 */
export default async function ExplorePage() {
  const { books, studybites } = await getCatalog();

  return <ExploreView books={books} studybites={studybites} />;
}
