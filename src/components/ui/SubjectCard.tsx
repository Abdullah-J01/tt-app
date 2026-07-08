import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { getSubjectName } from "@/i18n/subjectName";
import type { Subject } from "@/config/subjects";

/** TT-style subject card: circular icon badge, bold name, muted count. */
export async function SubjectCard({ subject }: { subject: Subject }) {
  const t = await getTranslations("components_ui_SubjectCard");
  const subjectName = await getSubjectName();
  const Icon = subject.icon;
  return (
    <Link
      href={`/explore/${subject.slug}`}
      className="flex items-center gap-4 rounded-card border border-hairline bg-surface p-4 transition-shadow hover:shadow-soft"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lavender text-violet">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold text-ink">{subjectName(subject.slug, subject.name)}</span>
        <span className="block text-sm text-muted">
          {t("itemsCount", { count: subject.count.toLocaleString() })}
        </span>
      </span>
    </Link>
  );
}
