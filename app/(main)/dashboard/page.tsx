import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/_components/Icon";

export const metadata: Metadata = {
  title: "Dashboard | Poll Precision",
  description: "Manage and analyze your active campaigns.",
};

type Trend = { value: string; direction: "up" | "down"; tone: string };

type StatCard = {
  label: string;
  value: string;
  icon: string;
  iconWrap: string;
  ringTint: string;
  trend: Trend;
};

const STATS: StatCard[] = [
  {
    label: "Total Polls",
    value: "124",
    icon: "ballot",
    iconWrap: "bg-surface-container text-primary",
    ringTint: "bg-primary/5",
    trend: { value: "12%", direction: "up", tone: "text-primary" },
  },
  {
    label: "Total Responses",
    value: "45.2k",
    icon: "group",
    iconWrap: "bg-secondary-container/10 text-secondary",
    ringTint: "bg-secondary/5",
    trend: { value: "8.4%", direction: "up", tone: "text-secondary" },
  },
  {
    label: "Avg Participation",
    value: "68%",
    icon: "data_usage",
    iconWrap: "bg-surface-container text-tertiary",
    ringTint: "bg-tertiary/5",
    trend: { value: "2.1%", direction: "down", tone: "text-error" },
  },
];

type Status = "active" | "draft" | "expired";

type PollRow = {
  id: string;
  title: string;
  status: Status;
  responses: number;
  progress: number;
  createdAt: string;
};

const POLLS: PollRow[] = [
  {
    id: "PL-8921",
    title: "Q3 Employee Satisfaction Survey",
    status: "active",
    responses: 1240,
    progress: 75,
    createdAt: "Oct 12, 2023",
  },
  {
    id: "PL-8922",
    title: "Product Roadmap Feedback 2024",
    status: "draft",
    responses: 0,
    progress: 0,
    createdAt: "Oct 15, 2023",
  },
  {
    id: "PL-8804",
    title: "Customer Support Rating - September",
    status: "expired",
    responses: 3492,
    progress: 100,
    createdAt: "Sep 01, 2023",
  },
];

function StatusBadge({ status }: { status: Status }) {
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

export default function DashboardOverviewPage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
            Overview
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage and analyze your active campaigns.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            type="button"
            className="flex-1 sm:flex-none px-5 py-2.5 bg-surface border border-outline text-on-surface rounded font-label-sm text-label-sm hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="download" className="text-[20px]" />
            Export
          </button>
          <Link
            href="/builder"
            className="flex-1 sm:flex-none px-5 py-2.5 bg-primary-container text-on-primary-container rounded font-label-sm text-label-sm hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Icon name="add" className="text-[20px]" />
            Create Poll
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 ambient-shadow relative overflow-hidden group"
          >
            <div
              className={`absolute -right-4 -top-4 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500 ${stat.ringTint}`}
            />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 font-medium">
                  {stat.label}
                </p>
                <h3 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface font-bold">
                  {stat.value}
                </h3>
              </div>
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center ${stat.iconWrap}`}
              >
                <Icon name={stat.icon} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span
                className={`${stat.trend.tone} font-semibold flex items-center gap-0.5`}
              >
                <Icon
                  name={
                    stat.trend.direction === "up"
                      ? "arrow_upward"
                      : "arrow_downward"
                  }
                  className="text-[16px] font-bold"
                />
                {stat.trend.value}
              </span>
              <span className="text-on-surface-variant">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden ambient-shadow">
        <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-lowest">
          <h3 className="font-headline-md text-[20px] text-on-surface font-bold">
            Recent Polls
          </h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
              />
              <input
                type="text"
                placeholder="Search polls..."
                className="pl-10 pr-4 py-2 border border-outline rounded bg-surface-container-low text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full sm:w-64 transition-all placeholder:text-on-surface-variant/60"
              />
            </div>
            <button
              type="button"
              className="p-2 border border-outline rounded text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center justify-center"
            >
              <Icon name="filter_list" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low/30">
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Poll Title
                </th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Status
                </th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Responses
                </th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Date Created
                </th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {POLLS.map((poll) => (
                <tr
                  key={poll.id}
                  className="hover:bg-surface-container-low/40 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="font-body-md text-on-surface font-semibold">
                      {poll.title}
                    </div>
                    <div className="font-mono-data text-[12px] text-on-surface-variant/80 mt-0.5">
                      #{poll.id}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={poll.status} />
                  </td>
                  <td className="px-6 py-5">
                    {poll.status === "draft" ? (
                      <span className="font-mono-data text-on-surface-variant">
                        0
                      </span>
                    ) : (
                      <div className="flex items-center gap-4">
                        <span className="font-mono-data text-on-surface font-medium">
                          {poll.responses.toLocaleString()}
                        </span>
                        <div className="w-28 h-2 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              poll.status === "expired"
                                ? "bg-outline"
                                : "bg-primary"
                            }`}
                            style={{ width: `${poll.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 font-body-md text-sm text-on-surface-variant">
                    {poll.createdAt}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      type="button"
                      className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container rounded-full"
                    >
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-5 border-t border-outline-variant bg-surface-container-lowest flex justify-center">
          <button
            type="button"
            className="text-primary font-label-sm text-label-sm font-bold hover:underline underline-offset-4 decoration-2"
          >
            View All Polls
          </button>
        </div>
      </div>
    </>
  );
}
