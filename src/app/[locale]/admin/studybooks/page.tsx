import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import Link from "@/i18n/Link";
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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_admin_studybooks_page");
  return { title: t("metaTitle") };
}

interface StudybooksPageProps {
  searchParams: Promise<{ q?: string; subject?: string; grade?: string; page?: string }>;
}

/** Studybook management: searchable, filterable, paginated catalog table. */
export default async function AdminStudybooksPage({ searchParams }: StudybooksPageProps) {
  const t = await getTranslations("app_admin_studybooks_page");
  const { q, subject, grade, page } = await searchParams;
  const result = await adminListStudybooks({ q, subject, grade, page: Number(page) || 1 });
  const filtered = Boolean(q || subject || grade);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-ink text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted mt-1 text-sm">
            {t("count", { count: result.total, filtered: String(filtered) })}
          </p>
        </div>
        <Link href="/admin/studybooks/new">
          <Button size="sm" leadingIcon={<Plus />}>
            {t("newStudybook")}
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-56 flex-1">
          <SearchParamInput placeholder={t("searchPlaceholder")} />
        </div>
        <StudybookFilters />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<BookOpen />}
          title={filtered ? t("emptyMatchTitle") : t("emptyTitle")}
          description={filtered ? t("emptyMatchBody") : t("emptyBody")}
          action={
            !filtered && (
              <Link href="/admin/studybooks/new">
                <Button size="sm" leadingIcon={<Plus />}>
                  {t("newStudybook")}
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
