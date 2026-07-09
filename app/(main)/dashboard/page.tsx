import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/_components/Icon";
import { getAllPollsByUserId } from "@/app/actions/poll";
import { PollsTable, type PollRow } from "../_components/PollsTable";
import { getStatsDetails } from "@/app/utils";

export const metadata: Metadata = {
  title: "Dashboard | Poll Precision",
  description: "Manage and analyze your active campaigns.",
};

export default async function DashboardOverviewPage() {
  const polls = await getAllPollsByUserId();

  const recentPolls: PollRow[] = polls
    .map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      expiresAt: p.expiresAt,
      responseCount: p.responses?.length ?? 0,
      createdAt: p.createdAt,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const statsDetails = await getStatsDetails();
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
          <a
            href="/api/export/responses"
            download
            className="flex-1 sm:flex-none px-4 py-2 bg-surface border border-outline text-on-surface rounded-lg font-label-sm text-label-sm cursor-pointer hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="download" className="text-[20px]" />
            Export
          </a>
          <Link
            href="/builder"
            className="flex-1 sm:flex-none px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-label-sm text-label-sm hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Icon name="add" className="text-[20px]" />
            Create Poll
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsDetails.map((stat) => (
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
                    stat.trend.direction === "up" ?
                      "arrow_upward"
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

      <PollsTable
        polls={recentPolls}
        title="Recent Polls"
        limit={5}
        rowHrefBase="/analytics"
        viewAllHref="/mypolls"
        showDescription={true}
      />
    </>
  );
}
