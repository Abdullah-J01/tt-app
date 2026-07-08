import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { getSubjectName } from "@/i18n/subjectName";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { IconBadge } from "@/components/ui/IconBadge";
import { adminListSubjects } from "@/features/admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_admin_subjects_page");
  return { title: t("metaTitle") };
}

/**
 * Subject taxonomy overview. Read-only: subjects are owned by TT
 * (docs/TT_API_ENDPOINTS.md §A) — this app only maps studybooks onto them.
 */
export default async function AdminSubjectsPage() {
  const t = await getTranslations("app_admin_subjects_page");
  const subjectName = await getSubjectName();
  const rows = await adminListSubjects();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-ink text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted mt-1 text-sm">
          {t("subtitle", { count: rows.length })}
        </p>
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t("colSubject")}</TableHeaderCell>
            <TableHeaderCell>{t("colSlug")}</TableHeaderCell>
            <TableHeaderCell className="text-right">{t("colStudybooks")}</TableHeaderCell>
            <TableHeaderCell className="text-right">{t("colMaterials")}</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {rows.map(({ subject, studybooks }) => {
            const Icon = subject.icon;
            return (
              <TableRow key={subject.slug}>
                <TableCell>
                  <span className="flex items-center gap-3">
                    <IconBadge icon={<Icon className={subject.color} />} size="sm" />
                    <span className="text-ink font-medium">{subjectName(subject.slug, subject.name)}</span>
                  </span>
                </TableCell>
                <TableCell className="text-muted font-mono text-xs">{subject.slug}</TableCell>
                <TableCell className="text-ink text-right font-medium">{studybooks}</TableCell>
                <TableCell className="text-muted text-right">
                  {subject.count.toLocaleString("en")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
