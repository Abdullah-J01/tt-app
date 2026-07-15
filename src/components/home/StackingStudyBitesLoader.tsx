"use client";

import dynamic from "next/dynamic";
import { StackingStudyBitesSkeleton } from "@/components/skeletons";
import type { DeckBook } from "./deckBook";

/**
 * Client-only stacked deck (scroll-driven framer-motion). The skeleton keeps
 * the deck's exact card gaps and tail height, so the section below never
 * shifts and the sticky-stack scroll progress is measured correctly on mount.
 */
const StackingStudyBites = dynamic(
  () => import("./StackingStudyBites").then((m) => m.StackingStudyBites),
  { ssr: false, loading: () => <StackingStudyBitesSkeleton /> },
);

export default function StackingStudyBitesLoader({ books }: { books: DeckBook[] }) {
  return <StackingStudyBites books={books} />;
}
