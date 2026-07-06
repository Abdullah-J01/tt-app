import { SearchSkeleton } from "@/components/skeletons";

/** Streams in place of the search page only while searchCatalog() is pending. */
export default function SearchLoading() {
  return <SearchSkeleton />;
}
