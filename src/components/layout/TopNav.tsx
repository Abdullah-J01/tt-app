import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/config/site";

/** Desktop top navigation — mirrors TaskuTark (logo, search, links, login). */
export function TopNav() {
  return (
    <header className="border-hairline bg-surface/90 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Logo />

        <div className="relative hidden flex-1 md:block">
          <Search className="text-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search studybooks, subjects…"
            className="border-hairline bg-lavender/50 focus:border-violet h-10 w-full rounded-full border pr-4 pl-9 text-sm outline-none"
          />
        </div>

        <nav className="hidden items-center gap-5 md:flex">
          {SITE.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink hover:text-violet text-sm font-medium transition-colors"
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
