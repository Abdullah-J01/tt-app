import Link from "next/link";
import { GraduationCap, Globe, Mail, Share2, ArrowRight } from "lucide-react";
import { SITE } from "@/config/site";
import { SUBJECTS, GRADES } from "@/config/subjects";

/** Modern plum-gradient footer: CTA band, brand, socials, link columns, legal. */
export function Footer() {
  return (
    <footer className="bg-plum relative mt-16 overflow-hidden text-white">
      {/* Accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-violet via-amber to-brand-green" />

      {/* CTA band */}
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl font-bold">Learn something new today.</p>
          <p className="mt-1 text-white/70">{SITE.tagline}</p>
        </div>
        <Link
          href="/feed"
          className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
          Open the app
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 border-t border-white/10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg font-bold">{SITE.name}</span>
          </span>
          <p className="mt-3 max-w-xs text-sm text-white/70">{SITE.description}</p>
          <div className="mt-4 flex gap-2">
            <Social href="#" label="Website">
              <Globe className="h-4 w-4" />
            </Social>
            <Social href="#" label="Email">
              <Mail className="h-4 w-4" />
            </Social>
            <Social href="#" label="Share">
              <Share2 className="h-4 w-4" />
            </Social>
          </div>
        </div>

        <FooterCol title="Explore" links={SITE.nav.map((n) => ({ href: n.href, label: n.label }))} />
        <FooterCol
          title="Subjects"
          links={SUBJECTS.slice(0, 5).map((s) => ({ href: `/explore/${s.slug}`, label: s.name }))}
        />
        <FooterCol
          title="Grades"
          links={GRADES.filter((g) => g.slug !== "all").map((g) => ({
            href: `/explore?grade=${g.slug}`,
            label: g.label,
          }))}
        />
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-white/60 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {SITE.name}
          </span>
          <span className="flex gap-4">
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
    >
      {children}
    </Link>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-white">{title}</p>
      <ul className="space-y-2 text-sm text-white/70">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
