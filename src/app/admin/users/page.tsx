import type { Metadata } from "next";
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

export const metadata: Metadata = { title: "Users" };

interface UsersPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const joinedFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

/**
 * User management. Mock-backed until TT confirms a users endpoint
 * (docs/TT_API_ENDPOINTS.md §B) — the table and search are wired and ready.
 */
export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const { q, page } = await searchParams;
  const result = await adminListUsers({ q, page: Number(page) || 1 });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-ink text-2xl font-bold">Users</h1>
        <p className="text-muted mt-1 text-sm">
          {result.total} user{result.total === 1 ? "" : "s"} · sample data until TT exposes a users
          endpoint.
        </p>
      </div>

      <div className="max-w-md">
        <SearchParamInput placeholder="Search by name or email…" />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="No users match"
          description="Try a different name or email."
        />
      ) : (
        <>
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Plan</TableHeaderCell>
                <TableHeaderCell>Joined</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {result.items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-ink font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted">{user.email}</TableCell>
                  <TableCell>
                    {user.role === "admin" ? <Pill variant="solid">Admin</Pill> : <Pill variant="mist">User</Pill>}
                  </TableCell>
                  <TableCell>
                    {user.plan === "premium" ? (
                      <Pill variant="green">Premium</Pill>
                    ) : (
                      <Pill variant="mist">Free</Pill>
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
