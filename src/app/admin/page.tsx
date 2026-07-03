import Link from "next/link";
import { ArrowRight, BookOpen, Layers, Plus, Tags, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconBadge } from "@/components/ui/IconBadge";
import { adminListStudybooks, adminStats, StudybookTable } from "@/features/admin";

/** Admin dashboard: catalog stats at a glance + the most recent studybooks. */
export default async function AdminDashboardPage() {
  const [stats, recent] = await Promise.all([adminStats(), adminListStudybooks({ perPage: 5 })]);

  const tiles = [
    { label: "Studybooks", value: stats.studybooks, icon: <BookOpen />, variant: "violet" as const },
    { label: "Bite cards", value: stats.cards, icon: <Layers />, variant: "green" as const },
    { label: "Subjects", value: stats.subjects, icon: <Tags />, variant: "amber" as const },
    { label: "Users", value: stats.users, icon: <Users />, variant: "grey" as const },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-ink text-2xl font-bold">Dashboard</h1>
          <p className="text-muted mt-1 text-sm">What&apos;s in the catalog right now.</p>
        </div>
        <Link href="/admin/studybooks/new">
          <Button size="sm" leadingIcon={<Plus />}>
            New studybook
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label} className="flex items-center gap-3">
            <IconBadge icon={tile.icon} variant={tile.variant} shape="rounded" size="sm" />
            <div>
              <p className="font-display text-ink text-xl font-bold">{tile.value}</p>
              <p className="text-muted text-xs">{tile.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <section className="flex flex-col gap-3" aria-label="Recent studybooks">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-ink text-lg font-bold">Recent studybooks</h2>
          <Link
            href="/admin/studybooks"
            className="text-violet flex items-center gap-1 text-sm font-semibold hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <StudybookTable books={recent.items} />
      </section>
    </div>
  );
}
