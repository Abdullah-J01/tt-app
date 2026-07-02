import Link from "next/link";
import { SectionHeader } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { SubjectCarousel } from "./SubjectCarousel";

/**
 * "Explore by subject" home section: a section header plus the scroll-spun 3D
 * coverflow of subject cards. The carousel is full-bleed, so the header sits in
 * the standard max-w container while the deck spans the width.
 */
export function ExploreSection() {
  return (
    <section className="pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          title="Explore by subject"
          subtitle="Scroll to browse — pick a subject and start learning."
          action={
            <Link href="/explore">
              <Button variant="secondary" size="sm">
                All subjects
              </Button>
            </Link>
          }
        />
      </div>
      <SubjectCarousel />
    </section>
  );
}
