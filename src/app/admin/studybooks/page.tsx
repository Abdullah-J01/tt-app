import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  AdminPager,
  SearchParamInput,
  StudybookFilters,
  StudybookTable,
  adminListStudybooks,
} from "@/features/admin";

export const metadata: Metadata = { title: "Studybooks" };

interface StudybooksPageProps {
  searchParams: Promise<{ q?: string; subject?: string; grade?: string; page?: string }>;
}

/** Studybook management: searchable, filterable, paginated catalog table. */
export default async function AdminStudybooksPage({ searchParams }: StudybooksPageProps) {
  const { q, subject, grade, page } = await searchParams;
  const result = await adminListStudybooks({ q, subject, grade, page: Number(page) || 1 });
  const filtered = Boolean(q || subject || grade);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-ink text-2xl font-bold">Studybooks</h1>
          <p className="text-muted mt-1 text-sm">
            {result.total} studybook{result.total === 1 ? "" : "s"}
            {filtered && " matching your filters"}
          </p>
        </div>
        <Link href="/admin/studybooks/new">
          <Button size="sm" leadingIcon={<Plus />}>
            New studybook
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-56 flex-1">
          <SearchParamInput placeholder="Search by title or author…" />
        </div>
        <StudybookFilters />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<BookOpen />}
          title={filtered ? "No studybooks match" : "No studybooks yet"}
          description={
            filtered
              ? "Try a different search or clear the filters."
              : "Create the first studybook to start building the catalog."
          }
          action={
            !filtered && (
              <Link href="/admin/studybooks/new">
                <Button size="sm" leadingIcon={<Plus />}>
                  New studybook
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <>
          <StudybookTable books={result.items} />
          <AdminPager page={result.page} totalPages={result.totalPages} />
        </>
      )}
    </div>
  );
}
