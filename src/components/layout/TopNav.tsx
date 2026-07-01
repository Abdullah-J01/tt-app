import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/config/site";

/** Desktop top navigation — mirrors TaskuTark (logo, search, links, login). */
export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Logo />

        <div className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search studybooks, subjects…"
            className="h-10 w-full rounded-full border border-hairline bg-lavender/50 pl-9 pr-4 text-sm outline-none focus:border-violet"
          />
        </div>

        <nav className="hidden items-center gap-5 md:flex">
          {SITE.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink transition-colors hover:text-violet"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/login" className="ml-auto md:ml-0">
          <Button size="sm">Log in</Button>
        </Link>
      </div>
    </header>
  );
}
