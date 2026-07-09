import { notFound } from "next/navigation";
import StudybookReader from "@/components/feed/StudybookReader";
import { getStudybook } from "@/lib/api";

/**
 * Intercepted reader — shown when you reach /studybook/[slug]/read via an
 * in-app (soft) navigation, e.g. tapping "Start learning" on the detail page.
 * Rendered in the `@modal` slot as a fixed overlay so the detail page stays
 * behind it, dimmed + blurred by the reader's own backdrop (like the Preview).
 * A hard load / refresh of /read bypasses this and renders the full-page reader.
 */
export default async function ReaderModal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getStudybook(slug);
  if (!book) notFound();

  return (
    <div className="fixed inset-0 z-50">
      <StudybookReader book={book} />
    </div>
  );
}
