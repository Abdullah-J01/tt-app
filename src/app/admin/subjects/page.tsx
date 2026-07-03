import type { Metadata } from "next";
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

export const metadata: Metadata = { title: "Subjects" };

/**
 * Subject taxonomy overview. Read-only: subjects are owned by TT
 * (docs/TT_API_ENDPOINTS.md §A) — this app only maps studybooks onto them.
 */
export default async function AdminSubjectsPage() {
  const rows = await adminListSubjects();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-ink text-2xl font-bold">Subjects</h1>
        <p className="text-muted mt-1 text-sm">
          {rows.length} subjects. The taxonomy is managed in TaskuTark — counts below are from this
          catalog.
        </p>
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Subject</TableHeaderCell>
            <TableHeaderCell>Slug</TableHeaderCell>
            <TableHeaderCell className="text-right">Studybooks</TableHeaderCell>
            <TableHeaderCell className="text-right">TT materials</TableHeaderCell>
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
                    <span className="text-ink font-medium">{subject.name}</span>
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
