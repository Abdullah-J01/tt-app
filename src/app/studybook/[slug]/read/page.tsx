import { notFound } from "next/navigation";
import StudybookReader from "@/components/feed/StudybookReader";
import { getStudybook } from "@/lib/api";

/**
 * Studybook reader — full-page variant, reached on a hard load / refresh of
 * /read (soft navigations are intercepted by @modal/(.)read). Renders the same
 * StudybookReader as the modal so both entries look and behave identically:
 * fixed top bar + progress, animated swipe-up cards, action rail.
 */
export default async function ReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getStudybook(slug);
  if (!book) notFound();

  return <StudybookReader book={book} />;
}
