"use client";

import { Icon } from "@/app/_components/Icon";
import { Tooltip } from "@/app/_components/Tooltip";
import {
  getEffectiveStatus,
  type EffectiveStatus,
} from "@/app/utils/poll-status";
import type { PollStatusFilter } from "@/app/actions/poll-filters";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type PollRow = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  expiresAt: string | null;
  responseCount: number;
  questionCount?: number;
  createdAt: string;
};

export type PollsPage = { rows: PollRow[]; total: number };

export type FetchPollsPage = (args: {
  page: number;
  pageSize: number;
  query: string;
  status: PollStatusFilter;
}) => Promise<PollsPage>;

type Props = {
  title: string;
  /** Append the filtered/total count to the title, e.g. "All Polls (12)". */
  showCount?: boolean;
  showDescription?: boolean;
  showQuestions?: boolean;
  showExpires?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Override the per-row action buttons. Defaults to copy-link + open. */
  renderActions?: (poll: PollRow) => ReactNode;

  // ── Static mode (client-side): pass the full list. ──
  polls?: PollRow[];
  /** Cap rows and show a "view all" footer link. */
  limit?: number;
  viewAllHref?: string;

  // ── Server mode: pass a fetcher; the table pages/searches on the server. ──
  fetchPage?: FetchPollsPage;
  pageSize?: number;
  /** First page rendered on the server, to avoid an initial loading flash. */
  initialData?: PollsPage;

  /**
   * Fill the parent's height and scroll only the table body (header + footer
   * stay fixed). The parent must be a height-constrained flex column.
   */
  fillHeight?: boolean;
};

const STATUS_OPTIONS: { value: PollStatusFilter; label: string }[] = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "expired", label: "Expired" },
];

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function StatusBadge({ status }: { status: EffectiveStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
        <span className="w-2 h-2 rounded-full bg-[#137333] mr-2 animate-pulse" />
        Active
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]">
        Expired
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant border border-outline-variant">
      Draft
    </span>
  );
}

function CopyLinkButton({ pollId }: { pollId: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/poll/${pollId}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Tooltip label={copied ? "Copied!" : "Copy link"}>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container rounded-full"
      >
        <Icon name={copied ? "check" : "link"} className="text-[20px]" />
      </button>
    </Tooltip>
  );
}

function DefaultActions({ poll }: { poll: PollRow }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <CopyLinkButton pollId={poll.id} />
      <Tooltip label="Open poll">
        <Link
          href={`/poll/${poll.id}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open poll"
          className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container rounded-full"
        >
          <Icon name="open_in_new" className="text-[20px]" />
        </Link>
      </Tooltip>
    </div>
  );
}

function EmptyPollsWidget({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl ambient-shadow p-12 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
        <Icon name="ballot" className="text-3xl text-on-surface-variant" />
      </div>
      <h4 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">
        {title}
      </h4>
      <p className="font-body-md text-on-surface-variant mb-6 max-w-sm mx-auto">
        {description}
      </p>
      <Link
        href="/builder"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-label-sm text-label-sm hover:opacity-90 transition-all shadow-sm"
      >
        <Icon name="add" className="text-[20px]" />
        Create your first poll
      </Link>
    </div>
  );
}

function NoMatchesView({ onClear }: { onClear: () => void }) {
  return (
    <div className="p-12 text-center flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
        <Icon name="search_off" className="text-3xl text-on-surface-variant" />
      </div>
      <div>
        <p className="font-body-md font-semibold text-on-surface">
          No polls match your filter.
        </p>
        <p className="font-body-md text-sm text-on-surface-variant mt-1">
          Try a different keyword or status.
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-2 px-4 py-2 border border-outline text-on-surface rounded-lg font-label-sm text-label-sm hover:bg-surface-container-low transition-colors"
      >
        <Icon name="filter_alt_off" className="text-[18px]" />
        Clear filters
      </button>
    </div>
  );
}

export function PollsTable({
  title,
  showCount = false,
  showDescription = false,
  showQuestions = false,
  showExpires = false,
  emptyTitle = "You haven’t created any polls yet.",
  emptyDescription = "Spin up your first poll — share a link, watch responses land in real-time.",
  renderActions,
  polls = [],
  limit,
  viewAllHref,
  fetchPage,
  pageSize = 10,
  initialData,
  fillHeight = false,
}: Props) {
  const isServer = typeof fetchPage === "function";

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PollStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PollsPage>(
    initialData ?? { rows: [], total: 0 },
  );
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 350);
  const firstRun = useRef(true);

  // Server mode: fetch a page whenever page / debounced search / status change.
  useEffect(() => {
    if (!fetchPage) return;
    if (firstRun.current) {
      firstRun.current = false;
      if (initialData) return; // page 1 already seeded from the server
    }
    let active = true;
    setLoading(true);
    fetchPage({ page, pageSize, query: debouncedQuery, status: statusFilter })
      .then((res) => {
        if (active) setData(res);
      })
      .catch(() => {
        if (active) setData({ rows: [], total: 0 });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchPage, page, pageSize, debouncedQuery, statusFilter, initialData]);

  const onQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };
  const onStatusChange = (value: PollStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };
  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setPage(1);
  };

  // Static mode: filter the provided list client-side.
  const staticFiltered = useMemo(() => {
    if (isServer) return [];
    const q = query.trim().toLowerCase();
    return polls.filter((p) => {
      const matchesQuery = !q || p.title.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        getEffectiveStatus(p.status, p.expiresAt) === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [isServer, polls, query, statusFilter]);

  const rows =
    isServer ? data.rows
    : limit ? staticFiltered.slice(0, limit)
    : staticFiltered;

  const total = isServer ? data.total : staticFiltered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasFilters = query.trim() !== "" || statusFilter !== "all";
  const hasMoreStatic =
    !isServer && limit !== undefined && staticFiltered.length > limit;

  const showEmptyWidget =
    isServer ? !loading && !hasFilters && data.total === 0 : polls.length === 0;

  if (showEmptyWidget) {
    return (
      <EmptyPollsWidget title={emptyTitle} description={emptyDescription} />
    );
  }

  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  return (
    <div
      className={`bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden ambient-shadow ${
        fillHeight ? "flex flex-col md:min-h-0 md:flex-1" : ""
      }`}
    >
      <div className="shrink-0 p-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-headline-md text-[20px] text-on-surface font-bold flex items-center gap-2">
          {title}
          {showCount ? ` (${total})` : ""}
          {loading && (
            <Icon
              name="progress_activity"
              className="animate-spin text-[18px] text-on-surface-variant"
            />
          )}
        </h3>
        <div className="flex gap-2 w-full sm:w-auto items-center">
          <div className="relative flex-1 sm:flex-none">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search polls..."
              className="pl-10 pr-9 py-2 border border-outline rounded bg-surface-container-low text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full sm:w-64 transition-all placeholder:text-on-surface-variant/60"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                title="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors rounded-full p-0.5 hover:bg-surface-container"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            )}
          </div>
          <div className="relative">
            <Icon
              name="filter_list"
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-[20px] pointer-events-none transition-colors ${
                statusFilter === "all" ?
                  "text-on-surface-variant"
                : "text-primary"
              }`}
            />
            <select
              value={statusFilter}
              onChange={(e) =>
                onStatusChange(e.target.value as PollStatusFilter)
              }
              aria-label="Filter polls by status"
              className={`appearance-none pl-10 pr-9 py-2 border rounded bg-surface-container-low text-sm font-medium text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer transition-all hover:bg-surface-container ${
                statusFilter === "all" ? "border-outline" : (
                  "border-primary/40 bg-primary/[0.03]"
                )
              }`}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none"
            />
          </div>
        </div>
      </div>

      {rows.length === 0 ?
        <NoMatchesView onClear={clearFilters} />
      : <div
          className={`overflow-x-auto transition-opacity ${loading ? "opacity-60" : ""} ${
            fillHeight ? "md:flex-1 md:min-h-0 md:overflow-y-auto" : ""
          }`}
        >
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Poll
                </th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Status
                </th>
                {showQuestions && (
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    Questions
                  </th>
                )}
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Responses
                </th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Created
                </th>
                {showExpires && (
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    Expires
                  </th>
                )}
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {rows.map((poll) => (
                <tr
                  key={poll.id}
                  className="hover:bg-surface-container-low/40 transition-colors"
                >
                  <td className="px-6 py-5 max-w-[320px]">
                    <div className="font-body-md text-on-surface font-semibold truncate">
                      {poll.title}
                    </div>
                    {showDescription && poll.description && (
                      <div className="font-body-md text-sm text-on-surface-variant/90 mt-0.5 truncate">
                        {poll.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge
                      status={getEffectiveStatus(poll.status, poll.expiresAt)}
                    />
                  </td>
                  {showQuestions && (
                    <td className="px-6 py-5">
                      <span className="font-mono-data text-on-surface-variant">
                        {poll.questionCount ?? 0}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-5">
                    <span className="font-mono-data text-on-surface-variant">
                      {poll.responseCount}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-body-md text-sm text-on-surface-variant">
                    {dateFmt.format(new Date(poll.createdAt))}
                  </td>
                  {showExpires && (
                    <td className="px-6 py-5 font-body-md text-sm text-on-surface-variant">
                      {poll.expiresAt ?
                        dateFmt.format(new Date(poll.expiresAt))
                      : "—"}
                    </td>
                  )}
                  <td className="px-6 py-5">
                    {renderActions ?
                      renderActions(poll)
                    : <DefaultActions poll={poll} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }

      {/* Static "view all" footer */}
      {hasMoreStatic && viewAllHref && (
        <div className="shrink-0 p-5 border-t border-outline-variant flex justify-center">
          <Link
            href={viewAllHref}
            className="text-primary font-label-sm text-label-sm font-bold hover:underline underline-offset-4 decoration-2"
          >
            View All Polls ({staticFiltered.length})
          </Link>
        </div>
      )}

      {/* Server pagination footer */}
      {isServer && total > 0 && (
        <div className="shrink-0 p-4 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Showing {startIndex}–{endIndex} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={loading || page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-outline text-on-surface rounded-lg font-label-sm text-label-sm hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon name="chevron_left" className="text-[18px]" />
              Prev
            </button>
            <span className="font-label-sm text-label-sm text-on-surface-variant px-1">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={loading || page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-outline text-on-surface rounded-lg font-label-sm text-label-sm hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
