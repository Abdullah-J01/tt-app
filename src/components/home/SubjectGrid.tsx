import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { getSubjectName } from "@/i18n/subjectName";
import { SUBJECTS } from "@/config/subjects";
import { cn } from "@/lib/utils";

/**
 * Static, browseable grid of every subject. This is the "next section" grid —
 * moved out of the pinned ExploreSection reveal so it renders in normal flow
 * (no scroll-jacking, no blank space) and is always visible/clickable.
 */
export async function SubjectGrid() {
  const t = await getTranslations("components_home_SubjectGrid");
  const subjectName = await getSubjectName();
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
      {SUBJECTS.map((subject) => {
        const Icon = subject.icon;
        return (
          <Link key={subject.slug} href={`/explore/${subject.slug}`} className="block">
            <div className="border-ink/10 flex flex-col items-center gap-2 rounded-2xl border bg-white/80 p-4 text-center shadow-sm backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.03]">
              <Icon className={cn("h-6 w-6", subject.color)} strokeWidth={1.75} />
              <span className="text-ink text-sm font-medium">{subjectName(subject.slug, subject.name)}</span>
              <span className="text-ink/45 text-xs">{t("items", { count: subject.count.toLocaleString() })}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
