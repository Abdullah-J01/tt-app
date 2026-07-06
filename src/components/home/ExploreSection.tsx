"use client";

import dynamic from "next/dynamic";
import { ExploreSectionSkeleton } from "@/components/skeletons";

/**
 * "Explore by subject" home section: a pinned scroll reveal where the heading
 * zooms through and the subject cards fly in from every direction, closing with
 * a short concluding line before the browseable subject grid section below.
 *
 * Client-only (scroll-driven framer-motion). The skeleton reserves the same
 * scroll track + sticky panel, so the swap is shift-free and the reveal's
 * scroll progress measures correctly once SubjectReveal mounts.
 */
const SubjectReveal = dynamic(
  () => import("./SubjectReveal").then((m) => m.SubjectReveal),
  { ssr: false, loading: () => <ExploreSectionSkeleton /> },
);

export function ExploreSection() {
  return <SubjectReveal />;
}
