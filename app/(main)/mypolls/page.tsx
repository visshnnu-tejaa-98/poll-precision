import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/_components/Icon";
import { getMyPolls } from "@/app/actions/poll";
import { getEffectiveStatus } from "@/app/utils/poll-status";
import { MyPollsTable } from "./_components/MyPollsTable";

export const metadata: Metadata = {
  title: "My Polls | Poll Precision",
  description: "All the polls you have created.",
};

export default async function MyPollsPage() {
  const polls = await getMyPolls();

  const totalPolls = polls.length;
  const totalResponses = polls.reduce((sum, p) => sum + p.responseCount, 0);
  const activePolls = polls.filter(
    (p) => getEffectiveStatus(p.status, p.expiresAt) === "active",
  ).length;

  const stats = [
    { label: "Total Polls", value: totalPolls, icon: "ballot" },
    { label: "Active Polls", value: activePolls, icon: "bolt" },
    { label: "Total Responses", value: totalResponses, icon: "group" },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
            My Polls
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage every poll you have created.
          </p>
        </div>
        <Link
          href="/builder"
          className="w-full sm:w-auto px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-label-sm text-label-sm hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <Icon name="add" className="text-[20px]" />
          Create Poll
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 ambient-shadow flex items-center justify-between"
          >
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 font-medium">
                {stat.label}
              </p>
              <h3 className="font-display-lg text-display-lg-mobile text-on-surface font-bold">
                {stat.value}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-lg bg-surface-container text-primary flex items-center justify-center">
              <Icon name={stat.icon} />
            </div>
          </div>
        ))}
      </div>

      <MyPollsTable polls={polls} />
    </>
  );
}
