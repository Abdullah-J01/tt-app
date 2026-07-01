import type { Metadata } from "next";
import {
  ExploreView,
  SubjectCard,
  getFreshlyAdded,
  getPopular,
  getStudybites,
} from "@/features/explore";
import { SUBJECTS } from "@/config/subjects";

export const metadata: Metadata = { title: "Explore" };

/**
 * Catalog / browse (UI brief §6.4). TT-style: search, grade filter, subject grid,
 * freshly added, popular studybooks and studybites. Data is fetched here; the
 * grade-filter interactivity lives in <ExploreView> (client).
 */
export default async function ExplorePage() {
  const [freshly, popular, studybites] = await Promise.all([
    getFreshlyAdded(),
    getPopular(),
    getStudybites(),
  ]);

  const subjectGrid = (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {SUBJECTS.map((s) => (
        <SubjectCard key={s.slug} subject={s} />
      ))}
    </div>
  );

  return (
    <ExploreView
      subjectGrid={subjectGrid}
      freshly={freshly}
      popular={popular}
      studybites={studybites}
    />
  );
}
