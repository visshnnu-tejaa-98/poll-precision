export default function MyPollsLoading() {
  return (
    <div className="flex flex-col gap-6 md:h-[calc(100vh-96px)] md:overflow-hidden animate-pulse">
      {/* Header */}
      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded bg-surface-container-high" />
          <div className="h-4 w-72 max-w-full rounded bg-surface-container" />
        </div>
        <div className="h-9 w-36 rounded-lg bg-surface-container-high" />
      </div>

      {/* Stat cards */}
      <div className="shrink-0 grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
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
        <div className="shrink-0 p-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="h-6 w-32 rounded bg-surface-container-high" />
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="h-9 w-full sm:w-64 rounded bg-surface-container" />
            <div className="h-9 w-28 rounded bg-surface-container" />
          </div>
        </div>

        <div className="flex-1 divide-y divide-outline-variant">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-5">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-surface-container-high" />
                <div className="h-3 w-64 max-w-full rounded bg-surface-container" />
              </div>
              <div className="hidden md:block h-6 w-20 rounded-full bg-surface-container" />
              <div className="hidden lg:block h-4 w-10 rounded bg-surface-container" />
              <div className="hidden sm:block h-4 w-10 rounded bg-surface-container" />
              <div className="hidden md:block h-4 w-24 rounded bg-surface-container" />
              <div className="h-8 w-16 rounded-full bg-surface-container" />
            </div>
          ))}
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-outline-variant flex items-center justify-between">
          <div className="h-4 w-40 rounded bg-surface-container" />
          <div className="h-9 w-56 rounded bg-surface-container" />
        </div>
      </div>
    </div>
  );
}
