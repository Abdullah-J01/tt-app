import Link from "@/i18n/Link";
import { getTranslations } from "@/i18n/server";
import { getSubjectName } from "@/i18n/subjectName";
import { cn } from "@/lib/utils";
import type { Subject } from "@/config/subjects";

/** Subject tile: colored icon on top, bold name, muted count. On hover the
 *  border, icon and text turn violet (design §6.4). */
export async function SubjectCard({ subject }: { subject: Subject }) {
  const t = await getTranslations("features_explore_components_SubjectCard");
  const subjectName = await getSubjectName();
  const Icon = subject.icon;
  return (
    <Link
      href={`/explore/${subject.slug}`}
      className="tile-3d group flex flex-col gap-6 rounded-card border border-hairline bg-surface p-4 transition-colors hover:border-violet hover:bg-lavender/40"
    >
      <Icon
        className={cn("h-6 w-6 transition-colors", subject.color, "group-hover:text-violet")}
        aria-hidden
      />
      <span className="min-w-0">
        <span className="block truncate font-semibold text-ink transition-colors group-hover:text-violet">
          {subjectName(subject.slug, subject.name)}
        </span>
        <span className="block text-sm text-muted transition-colors group-hover:text-violet/70">
          {t("itemsCount", { count: subject.count.toLocaleString() })}
        </span>
      </span>
    </Link>
  );
}
