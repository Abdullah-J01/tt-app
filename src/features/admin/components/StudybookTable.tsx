import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { Pill } from "@/components/ui/Pill";
import type { Studybook } from "@/types";
import { gradeLabel, subjectName } from "../format";
import { StudybookRowActions } from "./StudybookRowActions";

interface StudybookTableProps {
  books: Studybook[];
  /** Hide the edit/delete column (e.g. on the dashboard preview). */
  readOnly?: boolean;
}

/** Studybook listing used by the admin list page and the dashboard preview. */
export function StudybookTable({ books, readOnly = false }: StudybookTableProps) {
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>Title</TableHeaderCell>
          <TableHeaderCell>Subject</TableHeaderCell>
          <TableHeaderCell>Grade</TableHeaderCell>
          <TableHeaderCell>Cards</TableHeaderCell>
          <TableHeaderCell>Price</TableHeaderCell>
          {!readOnly && (
            <TableHeaderCell>
              <span className="sr-only">Actions</span>
            </TableHeaderCell>
          )}
        </tr>
      </TableHead>
      <TableBody>
        {books.map((b) => (
          <TableRow key={b.id}>
            <TableCell>
              <Link
                href={`/admin/studybooks/${b.slug}`}
                className="text-ink hover:text-violet font-medium transition-colors"
              >
                {b.title}
              </Link>
              <p className="text-muted text-xs">
                {b.author} · {b.year}
              </p>
            </TableCell>
            <TableCell className="text-muted whitespace-nowrap">{subjectName(b.subjectSlug)}</TableCell>
            <TableCell className="text-muted whitespace-nowrap">{gradeLabel(b.grade)}</TableCell>
            <TableCell className="text-muted">{b.cards.length}</TableCell>
            <TableCell>
              {b.priceEur != null ? (
                <Pill variant="amber">€{b.priceEur.toFixed(2)}</Pill>
              ) : (
                <Pill variant="green">Free</Pill>
              )}
            </TableCell>
            {!readOnly && (
              <TableCell className="w-0">
                <StudybookRowActions slug={b.slug} title={b.title} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
