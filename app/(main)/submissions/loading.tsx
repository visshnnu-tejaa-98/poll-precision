export default function SubmissionsLoading() {
  return (
    <div className="flex flex-col gap-6 md:h-[calc(100vh-96px)] md:overflow-hidden animate-pulse">
      {/* Header */}
      <div className="shrink-0 space-y-2">
        <div className="h-7 w-48 rounded bg-surface-container-high" />
        <div className="h-4 w-80 max-w-full rounded bg-surface-container" />
      </div>

      {/* Stat cards */}
      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-surface-container" />
              <div className="h-8 w-16 rounded bg-surface-container-high" />
            </div>
            <div className="w-11 h-11 rounded-lg bg-surface-container" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden md:flex-1 md:min-h-0 flex flex-col">
        <div className="shrink-0 p-4 border-b border-outline-variant flex items-center justify-between gap-4">
          <div className="h-9 w-full md:w-96 rounded-lg bg-surface-container" />
          <div className="h-5 w-16 rounded bg-surface-container" />
        </div>

        <div className="flex-1 divide-y divide-outline-variant">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="w-8 h-8 rounded-full bg-surface-container shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-surface-container-high" />
                <div className="h-3 w-56 max-w-full rounded bg-surface-container" />
              </div>
              <div className="hidden sm:block h-4 w-40 rounded bg-surface-container" />
              <div className="hidden md:block h-5 w-20 rounded-full bg-surface-container" />
              <div className="h-8 w-8 rounded-full bg-surface-container" />
            </div>
          ))}
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-outline-variant flex items-center justify-between">
          <div className="h-4 w-40 rounded bg-surface-container" />
          <div className="h-9 w-52 rounded bg-surface-container" />
        </div>
      </div>
    </div>
  );
}
