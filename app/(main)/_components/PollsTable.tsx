"use client";

import { Icon } from "@/app/_components/Icon";
import {
  getEffectiveStatus,
  type EffectiveStatus,
} from "@/app/utils/poll-status";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

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

type Props = {
  polls: PollRow[];
  title: string;
  /** Append the filtered count to the title, e.g. "All Polls (12)". */
  showCount?: boolean;
  showDescription?: boolean;
  showQuestions?: boolean;
  showExpires?: boolean;
  /** When set, only the first `limit` rows are shown with a "view all" footer. */
  limit?: number;
  viewAllHref?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Override the per-row action buttons. Defaults to copy-link + open. */
  renderActions?: (poll: PollRow) => ReactNode;
};

type StatusFilter = "all" | "active" | "draft" | "expired";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
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
    <button
      type="button"
      onClick={copy}
      title="Copy share link"
      className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container rounded-full"
    >
      <Icon name={copied ? "check" : "link"} className="text-[20px]" />
    </button>
  );
}

function DefaultActions({ poll }: { poll: PollRow }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <CopyLinkButton pollId={poll.id} />
      <Link
        href={`/poll/${poll.id}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Open public poll"
        className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container rounded-full"
      >
        <Icon name="open_in_new" className="text-[20px]" />
      </Link>
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
  polls,
  title,
  showCount = false,
  showDescription = false,
  showQuestions = false,
  showExpires = false,
  limit,
  viewAllHref,
  emptyTitle = "You haven’t created any polls yet.",
  emptyDescription = "Spin up your first poll — share a link, watch responses land in real-time.",
  renderActions,
}: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return polls.filter((p) => {
      const matchesQuery = !q || p.title.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        getEffectiveStatus(p.status, p.expiresAt) === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [polls, query, statusFilter]);

  const visible = limit ? filtered.slice(0, limit) : filtered;
  const hasMore = limit !== undefined && filtered.length > limit;

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
  };

  if (polls.length === 0) {
    return <EmptyPollsWidget title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden ambient-shadow">
      <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-headline-md text-[20px] text-on-surface font-bold">
          {title}
          {showCount ? ` (${filtered.length})` : ""}
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search polls..."
              className="pl-10 pr-4 py-2 border border-outline rounded bg-surface-container-low text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full sm:w-64 transition-all placeholder:text-on-surface-variant/60"
            />
          </div>
          <div className="relative">
            <Icon
              name="filter_list"
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-[20px] pointer-events-none transition-colors ${
                statusFilter === "all"
                  ? "text-on-surface-variant"
                  : "text-primary"
              }`}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              aria-label="Filter polls by status"
              className={`appearance-none pl-10 pr-9 py-2 border rounded bg-surface-container-low text-sm font-medium text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer transition-all hover:bg-surface-container ${
                statusFilter === "all"
                  ? "border-outline"
                  : "border-primary/40 bg-primary/[0.03]"
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

      {visible.length === 0 ? (
        <NoMatchesView onClear={clearFilters} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low/30">
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
              {visible.map((poll) => (
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
                    <div className="font-mono-data text-[12px] text-on-surface-variant/70 mt-0.5">
                      #{poll.id}
                    </div>
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
                      {poll.expiresAt
                        ? dateFmt.format(new Date(poll.expiresAt))
                        : "—"}
                    </td>
                  )}
                  <td className="px-6 py-5">
                    {renderActions ? (
                      renderActions(poll)
                    ) : (
                      <DefaultActions poll={poll} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && viewAllHref && (
        <div className="p-5 border-t border-outline-variant flex justify-center">
          <Link
            href={viewAllHref}
            className="text-primary font-label-sm text-label-sm font-bold hover:underline underline-offset-4 decoration-2"
          >
            View All Polls ({filtered.length})
          </Link>
        </div>
      )}
    </div>
  );
}
