/** Skeleton shown while an admin page's data loads. */
export default function AdminLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-5" aria-label="Loading" role="status">
      <div className="flex flex-col gap-2">
        <div className="bg-mist h-8 w-48 rounded-lg" />
        <div className="bg-mist h-4 w-72 rounded-lg" />
      </div>
      <div className="bg-mist h-11 w-full max-w-md rounded-xl" />
      <div className="rounded-card border-hairline bg-surface overflow-hidden border">
        <div className="bg-lavender/60 h-11" />
        <div className="divide-hairline divide-y">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="bg-mist h-4 w-1/3 rounded" />
              <div className="bg-mist h-4 w-24 rounded" />
              <div className="bg-mist h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
