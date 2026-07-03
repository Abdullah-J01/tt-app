import { notFound } from "next/navigation";
import StudybookReader from "@/components/feed/StudybookReader";
import { getStudybook } from "@/lib/api";

/** Studybook reader — immersive card-by-card reader for one book (UI brief §4 + §6.3). */
export default async function ReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getStudybook(slug);
  if (!book) notFound();

  return <StudybookReader book={book} />;
}
