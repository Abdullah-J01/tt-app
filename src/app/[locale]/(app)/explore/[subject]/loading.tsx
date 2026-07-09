import { SubjectBooksSkeleton } from "@/components/skeletons";

/** Streams in place of a subject page only while listStudybooks() is pending. */
export default function SubjectLoading() {
  return <SubjectBooksSkeleton />;
}
