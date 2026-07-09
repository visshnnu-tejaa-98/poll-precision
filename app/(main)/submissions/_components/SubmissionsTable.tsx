"use client";

import { Icon } from "@/app/_components/Icon";
import { Tooltip } from "@/app/_components/Tooltip";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type SubmissionRow = {
  id: string;
  pollId: string;
  pollTitle: string;
  respondentName: string;
  respondentEmail: string | null;
  isAnonymous: boolean;
  answerCount: number;
  submittedAt: string;
};

export type SubmissionsPage = { rows: SubmissionRow[]; total: number };

export type FetchSubmissionsPage = (args: {
  page: number;
  pageSize: number;
  query: string;
}) => Promise<SubmissionsPage>;

type Props = {
  fetchPage: FetchSubmissionsPage;
  pageSize?: number;
  initialData: SubmissionsPage;
  fillHeight?: boolean;
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

const AVATAR_TINTS = [
  "bg-primary-container/20 text-primary",
  "bg-secondary-container/20 text-secondary",
  "bg-tertiary-container/20 text-tertiary",
  "bg-error-container/40 text-error",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function tintFor(seed: string): string {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return AVATAR_TINTS[sum % AVATAR_TINTS.length];
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Page numbers with ellipses, e.g. 1 … 4 5 6 … 128
function pageItems(current: number, total: number): (number | "dots")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "dots")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) items.push("dots");
  for (let i = left; i <= right; i++) items.push(i);
  if (right < total - 1) items.push("dots");
  items.push(total);
  return items;
}

export function SubmissionsTable({
  fetchPage,
  pageSize = 10,
  initialData,
  fillHeight = false,
}: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SubmissionsPage>(initialData);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 350);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return; // page 1 already seeded from the server
    }
    let active = true;
    setLoading(true);
    fetchPage({ page, pageSize, query: debouncedQuery })
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
  }, [fetchPage, page, pageSize, debouncedQuery]);

  const onQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const { rows, total } = data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  return (
    <div
      className={`bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden ambient-shadow ${
        fillHeight ? "flex flex-col md:min-h-0 md:flex-1" : ""
      }`}
    >
      <div className="shrink-0 p-4 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by respondent or poll title..."
            className="w-full pl-10 pr-9 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/60"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors rounded-full p-0.5 hover:bg-surface-container"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant">
          {loading && (
            <Icon
              name="progress_activity"
              className="animate-spin text-[18px]"
            />
          )}
          <span className="font-label-sm text-label-sm">{total} total</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
            <Icon name="inbox" className="text-3xl text-on-surface-variant" />
          </div>
          <div>
            <p className="font-body-md font-semibold text-on-surface">
              No submissions yet.
            </p>
            <p className="font-body-md text-sm text-on-surface-variant mt-1">
              Responses to your polls will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`overflow-x-auto transition-opacity ${loading ? "opacity-60" : ""} ${
            fillHeight ? "md:flex-1 md:min-h-0 md:overflow-y-auto" : ""
          }`}
        >
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
                  Respondent
                </th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
                  Poll Title
                </th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {rows.map((row) => {
                const submitted = new Date(row.submittedAt);
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-surface-container-low/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            row.isAnonymous
                              ? "bg-surface-container text-on-surface-variant"
                              : tintFor(row.respondentName)
                          }`}
                        >
                          {row.isAnonymous ? (
                            <Icon name="person" className="text-[18px]" />
                          ) : (
                            initials(row.respondentName)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-on-surface truncate">
                            {row.isAnonymous ? "Anonymous" : row.respondentName}
                          </p>
                          {row.respondentEmail && !row.isAnonymous && (
                            <p className="text-xs text-on-surface-variant truncate">
                              {row.respondentEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[280px]">
                      <p className="text-on-surface font-medium truncate">
                        {row.pollTitle}
                      </p>
                      <p className="text-xs text-on-surface-variant font-mono-data">
                        {row.answerCount} answer{row.answerCount === 1 ? "" : "s"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-mono-data text-sm whitespace-nowrap">
                      {dateFmt.format(submitted)} • {timeFmt.format(submitted)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e6f4ea] text-[#137333]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#137333]" />
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Tooltip label="Open poll">
                        <Link
                          href={`/poll/${row.pollId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open poll"
                          className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container rounded-full inline-flex"
                        >
                          <Icon name="open_in_new" className="text-[20px]" />
                        </Link>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && (
        <div className="shrink-0 px-6 py-4 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Showing {startIndex} to {endIndex} of {total} results
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={loading || page <= 1}
              aria-label="Previous page"
              className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </button>
            {pageItems(page, totalPages).map((item, i) =>
              item === "dots" ? (
                <span
                  key={`dots-${i}`}
                  className="px-2 text-on-surface-variant"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  disabled={loading}
                  className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                    item === page
                      ? "bg-primary text-on-primary"
                      : "text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={loading || page >= totalPages}
              aria-label="Next page"
              className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
