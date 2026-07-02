"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type Tab = "cards" | "studybooks";

/** Personal library / stash (UI brief §6.6). Empty states shown by default. */
export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>("cards");

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-24 md:py-10 md:pb-12">
      <h1 className="text-2xl font-bold">Library</h1>

      <div className="mt-4 flex gap-2">
        <TabButton active={tab === "cards"} onClick={() => setTab("cards")}>
          Saved cards
        </TabButton>
        <TabButton active={tab === "studybooks"} onClick={() => setTab("studybooks")}>
          Studybooks
        </TabButton>
      </div>

      {/* Empty state (replace with saved items from API) */}
      <div className="mt-12 flex flex-col items-center text-center">
        <span className="bg-lavender text-violet grid h-16 w-16 place-items-center rounded-full">
          <Bookmark className="h-8 w-8" />
        </span>
        <p className="mt-4 font-semibold">
          {tab === "cards" ? "No saved cards yet" : "No studybooks yet"}
        </p>
        <p className="text-muted mt-1 max-w-xs text-sm">
          Tap the bookmark on any card to save it here for later.
        </p>
        <Link href="/feed" className="mt-6">
          <Button>Go to feed</Button>
        </Link>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      unstyled
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-violet text-white" : "bg-lavender text-ink hover:bg-violet/10",
      )}
    >
      {children}
    </Button>
  );
}
