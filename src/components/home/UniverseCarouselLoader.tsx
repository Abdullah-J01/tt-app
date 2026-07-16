"use client";

import dynamic from "next/dynamic";
import { UniverseCarouselSkeleton } from "@/components/skeletons";
import type { DeckBook } from "./deckBook";

/**
 * Client-only 3D spiral (scroll-driven framer-motion). The skeleton reserves
 * the carousel's pinned scroll track, so nothing below shifts and the spiral's
 * scroll progress measures correctly once the real component mounts.
 */
const UniverseCarousel = dynamic(
  () => import("./UniverseCarousel").then((m) => m.UniverseCarousel),
  { ssr: false, loading: () => <UniverseCarouselSkeleton /> },
);

export default function UniverseCarouselLoader({ books }: { books: DeckBook[] }) {
  return <UniverseCarousel books={books} />;
}
