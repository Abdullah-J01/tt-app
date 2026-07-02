import { Pencil, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProfileHeaderProps {
  name: string;
  /** Secondary line, e.g. "@mialepik · Grade 7". */
  handle: string;
}

/** Profile header — avatar, name, handle, edit affordance (UI brief §6.7). */
export function ProfileHeader({ name, handle }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-lavender text-violet flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full">
        <User className="h-8 w-8" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-ink truncate text-xl font-bold">{name}</p>
        <p className="text-muted truncate text-sm">{handle}</p>
      </div>
      {/* TODO(team): wire edit profile */}
      <Button
        unstyled
        type="button"
        aria-label="Edit profile"
        className="text-muted hover:bg-lavender hover:text-ink flex h-10 w-10 items-center justify-center rounded-full transition-colors"
      >
        <Pencil className="h-5 w-5" aria-hidden />
      </Button>
    </div>
  );
}
