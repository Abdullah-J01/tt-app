"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

/** Error boundary for the admin section — keeps the shell up and offers a retry. */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card>
      <EmptyState
        icon={<AlertTriangle />}
        title="Something went wrong"
        description="The admin panel hit an unexpected error. Try again — if it keeps happening, check the server logs."
        action={
          <Button size="sm" onClick={reset}>
            Try again
          </Button>
        }
      />
    </Card>
  );
}
