import { Pencil, User } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  /** Secondary line, e.g. "@mialepik · Grade 7". */
  handle: string;
}

/** Profile header — avatar, name, handle, edit affordance (UI brief §6.7). */
export function ProfileHeader({ name, handle }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-lavender text-violet">
        <User className="h-8 w-8" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-xl font-bold text-ink">{name}</p>
        <p className="truncate text-sm text-muted">{handle}</p>
      </div>
      {/* TODO(team): wire edit profile */}
      <button
        type="button"
        aria-label="Edit profile"
        className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-lavender hover:text-ink"
      >
        <Pencil className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
