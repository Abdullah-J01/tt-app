import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { listStudybooks } from "@/lib/api";

export const metadata: Metadata = { title: "Admin" };

/**
 * Admin CMS (UI brief §6.10) — low-fidelity placeholder.
 * NOTE: content is authored in TT's own CMS. If TT exposes write endpoints,
 * this can manage studybooks/cards; otherwise it's read-only here.
 */
export default async function AdminPage() {
  const studybooks = await listStudybooks();
  return (
    <div className="min-h-[100svh] bg-surface">
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo href="/admin" />
            <span className="rounded-full bg-lavender px-2 py-0.5 text-xs font-semibold text-violet">
              CMS
            </span>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4" /> New studybook
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold">Studybooks</h1>

        <div className="mt-6 overflow-hidden rounded-card border border-hairline">
          <table className="w-full text-left text-sm">
            <thead className="bg-lavender/60 text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Grade</th>
                <th className="px-4 py-3 font-semibold">Cards</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {studybooks.map((b) => (
                <tr key={b.id} className="hover:bg-lavender/30">
                  <td className="px-4 py-3 font-medium">{b.title}</td>
                  <td className="px-4 py-3 text-muted">{b.subjectSlug}</td>
                  <td className="px-4 py-3 text-muted">{b.grade}</td>
                  <td className="px-4 py-3 text-muted">{b.cards.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-muted">
          Placeholder table. Build a card editor (add/reorder bite cards with text + image) and
          wire to the API.
        </p>
      </main>
    </div>
  );
}
