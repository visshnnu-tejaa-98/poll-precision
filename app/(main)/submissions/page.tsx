import type { Metadata } from "next";
import { Icon } from "@/app/_components/Icon";
import {
  getMySubmissionsPaginated,
  getMySubmissionsStats,
} from "@/app/actions/responses";
import { SubmissionsTable } from "./_components/SubmissionsTable";

export const metadata: Metadata = {
  title: "Submissions | Poll Precision",
  description: "Track and manage responses across all your polls.",
};

const PAGE_SIZE = 10;

export default async function SubmissionsPage() {
  const [
    { totalSubmissions, uniqueRespondents, anonymousCount, activePolls },
    firstPage,
  ] = await Promise.all([
    getMySubmissionsStats(),
    getMySubmissionsPaginated({ page: 1, pageSize: PAGE_SIZE, query: "" }),
  ]);

  const stats = [
    { label: "Total Submissions", value: totalSubmissions, icon: "group" },
    { label: "Unique Respondents", value: uniqueRespondents, icon: "person" },
    { label: "Anonymous", value: anonymousCount, icon: "visibility_off" },
    { label: "Active Polls", value: activePolls, icon: "bolt" },
  ];

  return (
    <div className="flex flex-col gap-6 md:h-[calc(100vh-96px)] md:overflow-hidden">
      <div className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
            Submissions
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Track and manage responses across all your polls.
          </p>
        </div>
      </div>

      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <SubmissionsTable
        fetchPage={getMySubmissionsPaginated}
        pageSize={PAGE_SIZE}
        initialData={firstPage}
        fillHeight
      />
    </div>
  );
}
