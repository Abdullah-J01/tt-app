import { Suspense } from "react";
import Link from "@/i18n/Link";
import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { getSubjectName } from "@/i18n/subjectName";
import { Clock, SearchX } from "lucide-react";
import { SearchBar, CoverCard, StudybiteCard, searchCatalog } from "@/features/explore";
import { SUBJECTS, type Subject } from "@/config/subjects";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_app_explore_search_page");
  return { title: t("title") };
}

/** Sample quick-search entries. TODO(team): persist real recents per user. */
const RECENT = ["the water cycle", "photosynthesis", "ancient Rome"];
const SUGGESTED = ["Photosynthesis", "Solar system", "Word problems", "Ancient Rome"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const t = await getTranslations("app_app_explore_search_page");
  const results = await searchCatalog(query);
  const hasResults =
    results.subjects.length + results.studybooks.length + results.studybites.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 md:pb-12">
      <Suspense fallback={<div className="h-[68px]" />}>
        <SearchBar />
      </Suspense>

      {!query ? (
        <EmptyState />
      ) : !hasResults ? (
        <NoResults query={query} />
      ) : (
        <div className="space-y-8 py-2">
          {/* Subjects */}
          {results.subjects.length > 0 && (
            <Group title={t("subjects")}>
              <div className="flex flex-wrap gap-2">
                {results.subjects.map((s) => (
                  <SubjectChip key={s.slug} subject={s} />
                ))}
              </div>
            </Group>
          )}

          {/* Studybooks */}
          {results.studybooks.length > 0 && (
            <Group title={t("studybooks")}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {results.studybooks.map((b) => (
                  <CoverCard key={b.id} book={b} />
                ))}
              </div>
            </Group>
          )}

          {/* Studybites */}
          {results.studybites.length > 0 && (
            <Group title={t("studybites")}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.studybites.map((bite) => (
                  <StudybiteCard key={bite.card.id} bite={bite} />
                ))}
              </div>
            </Group>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-wide text-muted">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Recent + suggested queries + subject chips (shown when the query is empty). */
async function EmptyState() {
  const t = await getTranslations("app_app_explore_search_page");
  return (
    <div className="space-y-8 py-2">
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted">{t("recent")}</h2>
        <ul className="mt-2">
          {RECENT.map((term) => (
            <li key={term}>
              <Link
                href={`/explore/search?q=${encodeURIComponent(term)}`}
                className="flex items-center gap-3 rounded-lg px-1 py-2.5 text-sm hover:bg-lavender/60"
              >
                <Clock className="h-4 w-4 shrink-0 text-muted" />
                {term}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted">{t("suggested")}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED.map((term) => (
            <QueryChip key={term} query={term} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted">{t("browseSubjects")}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <SubjectChip key={s.slug} subject={s} />
          ))}
        </div>
      </section>
    </div>
  );
}

async function SubjectChip({ subject }: { subject: Subject }) {
  const subjectName = await getSubjectName();
  const Icon = subject.icon;
  return (
    <Link
      href={`/explore/${subject.slug}`}
      className="inline-flex items-center gap-2 rounded-full bg-lavender px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-violet/10"
    >
      <Icon className={`h-4 w-4 ${subject.color}`} aria-hidden />
      {subjectName(subject.slug, subject.name)}
    </Link>
  );
}

function QueryChip({ query }: { query: string }) {
  return (
    <Link
      href={`/explore/search?q=${encodeURIComponent(query)}`}
      className="inline-flex items-center rounded-full bg-lavender px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-violet/10"
    >
      {query}
    </Link>
  );
}

async function NoResults({ query }: { query: string }) {
  const t = await getTranslations("app_app_explore_search_page");
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-lavender text-violet">
        <SearchX className="h-8 w-8" />
      </span>
      <p className="mt-4 font-semibold">{t("noMatches", { query })}</p>
      <p className="mt-1 max-w-xs text-sm text-muted">{t("noMatchesHint")}</p>
    </div>
  );
}
