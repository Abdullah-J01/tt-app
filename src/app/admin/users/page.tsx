import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { AdminPager, SearchParamInput, adminListUsers } from "@/features/admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_admin_users_page");
  return { title: t("metaTitle") };
}

interface UsersPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const joinedFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

/**
 * User management. Mock-backed until TT confirms a users endpoint
 * (docs/TT_API_ENDPOINTS.md §B) — the table and search are wired and ready.
 */
export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const t = await getTranslations("app_admin_users_page");
  const { q, page } = await searchParams;
  const result = await adminListUsers({ q, page: Number(page) || 1 });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-ink text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted mt-1 text-sm">
          {t("subtitle", { count: result.total })}
        </p>
      </div>

      <div className="max-w-md">
        <SearchParamInput placeholder={t("searchPlaceholder")} />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title={t("emptyTitle")}
          description={t("emptyBody")}
        />
      ) : (
        <>
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>{t("colName")}</TableHeaderCell>
                <TableHeaderCell>{t("colEmail")}</TableHeaderCell>
                <TableHeaderCell>{t("colRole")}</TableHeaderCell>
                <TableHeaderCell>{t("colPlan")}</TableHeaderCell>
                <TableHeaderCell>{t("colJoined")}</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {result.items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-ink font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted">{user.email}</TableCell>
                  <TableCell>
                    {user.role === "admin" ? <Pill variant="solid">{t("roleAdmin")}</Pill> : <Pill variant="mist">{t("roleUser")}</Pill>}
                  </TableCell>
                  <TableCell>
                    {user.plan === "premium" ? (
                      <Pill variant="green">{t("planPremium")}</Pill>
                    ) : (
                      <Pill variant="mist">{t("planFree")}</Pill>
                    )}
                  </TableCell>
                  <TableCell className="text-muted whitespace-nowrap">
                    {joinedFormat.format(new Date(user.joinedAt))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AdminPager page={result.page} totalPages={result.totalPages} />
        </>
      )}
    </div>
  );
}
