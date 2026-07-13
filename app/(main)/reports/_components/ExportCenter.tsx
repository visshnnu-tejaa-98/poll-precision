"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/app/_components/Icon";

export type ExportPoll = {
  id: string;
  title: string;
  responseCount: number;
};

export function ExportCenter({ polls }: { polls: ExportPoll[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? polls.filter((p) => p.title.toLowerCase().includes(q)) : polls;
  }, [polls, query]);

  return (
    <div className="bg-surface-container-lowest p-stack-lg rounded-xl border border-outline-variant shadow-sm flex flex-col md:h-full md:min-h-0">
      <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">
        Export Center
      </h2>
      <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">
        Download responses as CSV
      </p>

      {/* All responses */}
      <a
        href="/api/export/responses"
        download
        className="shrink-0 p-4 bg-primary/5 border border-primary/30 rounded-lg flex items-center justify-between group hover:border-primary transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon name="table_view" className="text-primary" />
          <div>
            <p className="font-label-sm text-on-surface font-bold leading-tight">
              All Responses
            </p>
            <p className="text-[12px] text-on-surface-variant">
              CSV • every poll
            </p>
          </div>
        </div>
        <Icon
          name="download"
          className="text-on-surface-variant group-hover:text-primary"
        />
      </a>

      {/* Per-poll search */}
      <div className="relative mt-4 shrink-0">
        <Icon
          name="search"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a form to export..."
          className="w-full pl-10 pr-9 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder:text-on-surface-variant/60"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface rounded-full p-0.5 hover:bg-surface-container"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        )}
      </div>

      {/* Per-poll list — capped so the items scroll internally instead of
          growing the whole page. */}
      <div className="mt-3 flex-1 min-h-0 overflow-y-auto max-h-[360px] space-y-2 pr-1">
        {polls.length === 0 ? (
          <p className="text-[12px] text-on-surface-variant py-6 text-center">
            No forms to export yet.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-[12px] text-on-surface-variant py-6 text-center">
            No forms match “{query}”.
          </p>
        ) : (
          filtered.map((poll) => (
            <a
              key={poll.id}
              href={`/api/export/responses?pollId=${poll.id}`}
              download
              className="p-3 bg-surface-container border border-outline-variant rounded-lg flex items-center justify-between gap-3 group hover:border-primary transition-colors"
            >
              <div className="min-w-0">
                <p className="font-label-sm text-on-surface font-semibold truncate leading-tight">
                  {poll.title}
                </p>
                <p className="text-[12px] text-on-surface-variant">
                  {poll.responseCount} response
                  {poll.responseCount === 1 ? "" : "s"}
                </p>
              </div>
              <Icon
                name="download"
                className="text-on-surface-variant group-hover:text-primary shrink-0"
              />
            </a>
          ))
        )}
      </div>
    </div>
  );
}
