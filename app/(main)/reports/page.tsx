import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/_components/Icon";
import { getReportsData } from "@/app/actions/reports";
import { getEffectiveStatus } from "@/app/utils/poll-status";
import { ExportCenter } from "./_components/ExportCenter";
import { CreatorLiveRefresh } from "../_components/CreatorLiveRefresh";

export const metadata: Metadata = {
  title: "Reports | Poll Precision",
  description: "Aggregated cross-poll performance and organizational metrics.",
};

const dayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function StatusBadge({ status }: { status: "active" | "draft" | "expired" }) {
  if (status === "active") {
    return (
      <span className="bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded text-[12px] font-bold">
        Live
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className="bg-[#fce8e6] text-[#c5221f] px-2 py-0.5 rounded text-[12px] font-bold">
        Expired
      </span>
    );
  }
  return (
    <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded text-[12px] font-bold">
      Draft
    </span>
  );
}

export default async function ReportsPage() {
  const data = await getReportsData();
  const {
    totalSubmissions,
    anonymousCount,
    authenticatedCount,
    uniqueRespondents,
    activePolls,
    trend,
    topPolls,
    exportPolls,
  } = data;

  const kpis = [
    { label: "Total Submissions", value: totalSubmissions, icon: "groups" },
    { label: "Unique Respondents", value: uniqueRespondents, icon: "person" },
    { label: "Active Polls", value: activePolls, icon: "bolt" },
    { label: "Anonymous", value: anonymousCount, icon: "visibility_off" },
  ];

  // Build the SVG trend line (viewBox 0..100).
  const maxTrend = Math.max(1, ...trend.map((t) => t.count));
  const n = trend.length;
  const points = trend
    .map((t, i) => {
      const x = n === 1 ? 0 : (i / (n - 1)) * 100;
      const y = 95 - (t.count / maxTrend) * 85;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const totalSources = Math.max(1, authenticatedCount + anonymousCount);
  const authPct = Math.round((authenticatedCount / totalSources) * 100);
  const anonPct = 100 - authPct;

  return (
    <>
      <CreatorLiveRefresh />
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-black">
            Platform Reports
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Aggregated cross-poll performance and organizational metrics.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="bg-surface-container-high text-on-surface px-4 py-2 rounded-lg font-label-sm text-label-sm flex items-center gap-2">
            <Icon name="calendar_month" className="text-[18px]" />
            Last 7 Days
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant"
          >
            <p className="text-on-surface-variant font-label-sm text-label-sm mb-1">
              {kpi.label}
            </p>
            <div className="flex items-end justify-between">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                {kpi.value.toLocaleString()}
              </h3>
              <Icon name={kpi.icon} className="text-[22px] text-primary" />
            </div>
          </div>
        ))}
      </section>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Global participation trends */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-stack-lg rounded-xl border border-outline-variant shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-stack-lg">
            <div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                Global Participation Trends
              </h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Daily submissions across all your polls
              </p>
            </div>
            <span className="flex items-center gap-1 font-label-sm text-[12px] text-on-surface-variant">
              <span className="w-3 h-3 rounded-full bg-primary" /> Submissions
            </span>
          </div>
          {totalSubmissions === 0 ? (
            <p className="text-on-surface-variant font-body-md text-sm py-12 text-center">
              No submissions yet.
            </p>
          ) : (
            <div className="flex-1 min-h-[16rem] w-full relative pt-4">
              <div className="absolute inset-x-0 top-4 bottom-6 flex flex-col justify-between opacity-10 pointer-events-none">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="border-t border-on-surface w-full" />
                ))}
              </div>
              <svg
                className="absolute inset-0 w-full h-[calc(100%-1.5rem)]"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <defs>
                  <linearGradient id="trendGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points={`0,100 ${points} 100,100`} fill="url(#trendGrad)" />
                <polyline
                  points={points}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-x-0 bottom-0 flex justify-between font-label-sm text-[10px] text-on-surface-variant">
                {trend.map((t) => (
                  <span key={t.date}>{dayFmt.format(new Date(t.date))}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Response sources */}
        <div className="bg-surface-container-lowest p-stack-lg rounded-xl border border-outline-variant shadow-sm">
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">
            Response Sources
          </h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-6">
            Authenticated vs anonymous
          </p>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between font-label-sm text-label-sm mb-1">
                <span className="text-on-surface">Authenticated</span>
                <span className="text-on-surface-variant font-mono-data">
                  {authenticatedCount.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${authPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-label-sm text-label-sm mb-1">
                <span className="text-on-surface">Anonymous</span>
                <span className="text-on-surface-variant font-mono-data">
                  {anonymousCount.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div
                  className="bg-secondary-container h-full rounded-full"
                  style={{ width: `${anonPct}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-outline-variant flex items-center gap-4">
            <div className="flex-1 text-center">
              <p className="font-label-sm text-[12px] text-on-surface-variant">
                Unique
              </p>
              <p className="font-headline-md text-[20px] font-bold text-on-surface">
                {uniqueRespondents.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-10 bg-outline-variant" />
            <div className="flex-1 text-center">
              <p className="font-label-sm text-[12px] text-on-surface-variant">
                Anon %
              </p>
              <p className="font-headline-md text-[20px] font-bold text-on-surface">
                {anonPct}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top polls + export center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-stack-lg border-b border-outline-variant flex justify-between items-center">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              Top Performing Polls
            </h2>
            <Link
              href="/mypolls"
              className="text-primary font-label-sm text-label-sm hover:underline"
            >
              View All
            </Link>
          </div>
          {topPolls.length === 0 ? (
            <p className="p-stack-lg text-on-surface-variant font-body-md text-sm text-center">
              No polls yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Poll Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Responses</th>
                    <th className="px-6 py-4 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {topPolls.map((poll) => (
                    <tr
                      key={poll.id}
                      className="hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-6 py-4 max-w-[280px]">
                        <Link
                          href={`/analytics/${poll.id}`}
                          className="font-label-sm text-on-surface font-bold truncate block hover:text-primary hover:underline"
                        >
                          {poll.title}
                        </Link>
                        <p className="text-[12px] text-on-surface-variant">
                          Created {dateFmt.format(new Date(poll.createdAt))}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={getEffectiveStatus(poll.status, poll.expiresAt)}
                        />
                      </td>
                      <td className="px-6 py-4 font-mono-data">
                        {poll.responseCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/analytics/${poll.id}`}
                          className="text-on-surface-variant hover:text-primary inline-flex"
                          aria-label="View analytics"
                        >
                          <Icon name="bar_chart" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Export center */}
        <ExportCenter polls={exportPolls} />
      </div>
    </>
  );
}
