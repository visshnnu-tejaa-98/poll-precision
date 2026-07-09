import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/app/_components/Icon";
import { getPollAnalytics } from "@/app/actions/poll";
import { getEffectiveStatus } from "@/app/utils/poll-status";
import { AnalyticsActions } from "./_components/AnalyticsActions";

type Props = { params: Promise<{ pollId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pollId } = await params;
  const data = await getPollAnalytics(pollId);
  return {
    title: data ? `${data.poll.title} · Analytics` : "Analytics | Poll Precision",
  };
}

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const dayLabelFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

export default async function PollAnalyticsPage({ params }: Props) {
  const { pollId } = await params;
  const data = await getPollAnalytics(pollId);

  if (!data) notFound();

  const { poll, totalResponses, anonymousCount, questions, timeline } = data;
  const effective = getEffectiveStatus(poll.status, poll.expiresAt);
  const maxDay = Math.max(1, ...timeline.map((t) => t.count));

  const kpis = [
    { label: "Total Responses", value: totalResponses, icon: "groups" },
    { label: "Questions", value: questions.length, icon: "help" },
    { label: "Anonymous", value: anonymousCount, icon: "visibility_off" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {effective === "active" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-error" />
                </span>
                Live
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold capitalize">
                {effective}
              </span>
            )}
            <span className="text-on-surface-variant font-body-md text-sm">
              Created {dateFmt.format(new Date(poll.createdAt))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/mypolls"
              className="text-on-surface-variant hover:text-primary transition-colors"
              aria-label="Back to My Polls"
            >
              <Icon name="arrow_back" className="text-[22px]" />
            </Link>
            <h1 className="font-display-lg-mobile text-display-lg-mobile md:text-headline-md text-on-surface">
              {poll.title}
            </h1>
          </div>
        </div>
        <AnalyticsActions pollId={poll.id} published={poll.resultsVisibility} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 text-on-surface-variant mb-4">
              <Icon name={kpi.icon} className="text-[20px]" />
              <h3 className="font-label-sm text-label-sm m-0">{kpi.label}</h3>
            </div>
            <span className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface font-bold leading-none">
              {kpi.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Participation timeline */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline-md text-[18px] text-on-surface">
            Participation Timeline
          </h2>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Last 14 days
          </span>
        </div>
        {totalResponses === 0 ? (
          <p className="text-on-surface-variant font-body-md text-sm py-8 text-center">
            No responses yet.
          </p>
        ) : (
          <>
            <div className="h-48 w-full flex items-end gap-2">
              {timeline.map((t) => (
                <div
                  key={t.date}
                  title={`${dayLabelFmt.format(new Date(t.date))}: ${t.count}`}
                  className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary transition-colors relative group"
                  style={{ height: `${Math.max(4, (t.count / maxDay) * 100)}%` }}
                >
                  <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-mono-data text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.count}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-on-surface-variant font-label-sm text-[12px]">
              <span>{dayLabelFmt.format(new Date(timeline[0].date))}</span>
              <span>
                {dayLabelFmt.format(
                  new Date(timeline[timeline.length - 1].date),
                )}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Question breakdown */}
      <div>
        <h2 className="font-headline-md text-[20px] text-on-surface mb-6">
          Question Breakdown
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm"
            >
              <span className="text-on-surface-variant font-label-sm text-label-sm mb-2 block">
                Question {index + 1} • Single Choice
              </span>
              <h3 className="font-body-md text-body-md text-on-surface font-medium mb-6">
                {q.title}
              </h3>
              <div className="space-y-3">
                {q.options.map((o) => (
                  <div key={o.id} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-left font-label-sm text-label-sm text-on-surface-variant truncate">
                      {o.text}
                    </span>
                    <div className="flex-1 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${o.percentage}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-mono-data text-mono-data text-on-surface-variant">
                      {o.percentage}%{" "}
                      <span className="text-on-surface-variant/60">
                        ({o.count})
                      </span>
                    </span>
                  </div>
                ))}
                {q.totalAnswers === 0 && (
                  <p className="text-on-surface-variant/70 font-label-sm text-label-sm">
                    No answers yet.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
