import Link from "next/link";
import { SITE } from "@/config/site";
import { SUBJECTS, GRADES } from "@/config/subjects";

/** TT-style footer: quick links, subjects, grades, legal. */
export function Footer() {
  return (
    <footer className="border-t border-hairline bg-lavender/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-bold text-brand-green">{SITE.name}</p>
          <p className="mt-2 text-sm text-muted">{SITE.tagline}</p>
        </div>

        <FooterCol title="Explore" links={SITE.nav.map((n) => ({ href: n.href, label: n.label }))} />

        <FooterCol
          title="Subjects"
          links={SUBJECTS.slice(0, 5).map((s) => ({
            href: `/explore/${s.slug}`,
            label: s.name,
          }))}
        />

        <FooterCol
          title="Grades"
          links={GRADES.filter((g) => g.slug !== "all").map((g) => ({
            href: `/explore?grade=${g.slug}`,
            label: g.label,
          }))}
        />
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <span className="flex gap-4">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/contact">Contact</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ink">{title}</p>
      <ul className="space-y-2 text-sm text-muted">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="hover:text-violet">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
