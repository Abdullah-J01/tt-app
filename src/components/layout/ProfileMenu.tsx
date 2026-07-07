"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Profile menu for the navbar (all sizes). The trigger is the profile icon;
 * clicking opens a small dropdown with the signed-in user's details, a link to
 * /profile, an admin shortcut, and a log-out action.
 */
export default function ProfileMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on Escape or a pointer press outside the menu.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const name = session?.user?.name ?? "You";
  const email = session?.user?.email ?? "";
  const isAdmin = session?.user?.role === "admin";

  return (
    <div ref={rootRef} className="relative flex items-center">
      <Button
        unstyled
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="navbar-profile-menu"
        className="text-ink/80 hover:text-ink inline-flex items-center gap-1.5 text-sm leading-none transition-colors"
      >
        <User size={18} />
      </Button>

      {open && (
        <div
          id="navbar-profile-menu"
          role="menu"
          aria-label="Profile"
          className="glass border-border shadow-lift absolute top-full right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border p-2"
        >
          <div className="flex items-center gap-3 px-3 py-3">
            <span className="bg-lavender grid h-10 w-10 shrink-0 place-items-center rounded-full">
              <User size={18} className="text-violet" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="text-ink block truncate text-sm font-semibold">{name}</span>
              {email && <span className="text-muted block truncate text-xs">{email}</span>}
            </span>
          </div>

          <div className="bg-hairline mx-3 h-px" />

          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="text-ink hover:bg-ink/5 active:bg-ink/10 mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
          >
            <User size={16} className="text-ink/70" aria-hidden />
            View profile
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="text-ink hover:bg-ink/5 active:bg-ink/10 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
            >
              <ShieldCheck size={16} className="text-ink/70" aria-hidden />
              Admin dashboard
            </Link>
          )}

          <Button
            unstyled
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="hover:bg-ink/5 active:bg-ink/10 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors"
          >
            <LogOut size={16} aria-hidden />
            Log out
          </Button>
        </div>
      )}
    </div>
  );
}
