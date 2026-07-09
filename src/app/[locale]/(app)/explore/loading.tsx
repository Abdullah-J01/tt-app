import { ExploreSkeleton } from "@/components/skeletons";

/** Streams in place of the Explore landing only while getCatalog() is pending. */
export default function ExploreLoading() {
  return <ExploreSkeleton />;
}
