/** "— or —" divider used between the primary form and social sign-in. */
export function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted">
      <span className="h-px flex-1 bg-hairline" /> or <span className="h-px flex-1 bg-hairline" />
    </div>
  );
}
