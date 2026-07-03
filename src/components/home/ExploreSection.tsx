import { SubjectReveal } from "./SubjectReveal";

/**
 * "Explore by subject" home section: a pinned scroll reveal where the heading
 * zooms through and the subject cards fly in from every direction, closing with
 * a short concluding line before the browseable subject grid section below.
 */
export function ExploreSection() {
  return (
    <>
      <SubjectReveal />
      {/* Concluding content of the reveal — replaces the old dead/blank scroll
          that used to sit after the cards, and leads into the subject grid. */}
      <div className="mx-auto max-w-2xl px-6 pb-14 text-center sm:pb-16"></div>
    </>
  );
}
