import { Icon } from "@/app/_components/Icon";

type ResultOption = {
  id: string;
  text: string;
  count: number;
  percentage: number;
};
type ResultQuestion = { id: string; title: string; options: ResultOption[] };

type Props = {
  totalResponses: number;
  questions: ResultQuestion[];
  myAnswers?: Record<string, string>;
};

export function PollResults({ totalResponses, questions, myAnswers }: Props) {
  return (
    <div className="space-y-10">
      <div className="flex items-center gap-2 text-tertiary">
        <Icon name="bar_chart" className="text-[22px]" />
        <span className="font-label-sm text-label-sm font-semibold text-on-surface">
          Live results · {totalResponses} response
          {totalResponses === 1 ? "" : "s"}
        </span>
      </div>

      {questions.map((question, index) => (
        <div key={question.id} className="space-y-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            {index + 1}. {question.title}
          </h2>
          <div className="space-y-3">
            {question.options.map((option) => {
              const mine = myAnswers?.[question.id] === option.id;
              return (
                <div key={option.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 font-body-md text-body-md">
                    <span className="text-on-surface flex items-center gap-1.5">
                      {option.text}
                      {mine && (
                        <span className="inline-flex items-center gap-0.5 text-primary font-label-sm text-label-sm">
                          <Icon name="check_circle" filled className="text-[16px]" />
                          Your pick
                        </span>
                      )}
                    </span>
                    <span className="font-mono-data text-on-surface-variant shrink-0">
                      {option.percentage}% ({option.count})
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${mine ? "bg-primary" : "bg-primary/50"}`}
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
