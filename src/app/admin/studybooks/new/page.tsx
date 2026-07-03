import type { Metadata } from "next";
import { StudybookForm } from "@/features/admin";

export const metadata: Metadata = { title: "New studybook" };

/** Create a studybook. Cards are added on the edit screen after creation. */
export default function NewStudybookPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-ink text-2xl font-bold">New studybook</h1>
        <p className="text-muted mt-1 text-sm">
          Set the metadata first — you can add bite cards right after creating it.
        </p>
      </div>
      <StudybookForm />
    </div>
  );
}
