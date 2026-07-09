"use client";

import { useState, type SubmitEvent } from "react";
import { Icon } from "@/app/_components/Icon";
import { submitPollResponse } from "@/app/actions/response";

type Option = { id: string; text: string };
type Question = {
  id: string;
  title: string;
  isRequired: boolean;
  options: Option[];
};

type Props = {
  pollId: string;
  questions: Question[];
  authenticatedOnly: boolean;
  /** Called after a successful submit; receives the submitted answers. When
   * provided, the form does not render its own thank-you screen. */
  onSubmitted?: (answers: Record<string, string>) => void;
};

export function PollResponseForm({
  pollId,
  questions,
  authenticatedOnly,
  onSubmitted,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const select = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setMissing((prev) => {
      if (!prev.has(questionId)) return prev;
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError("");

    const unanswered = questions
      .filter((q) => q.isRequired && !answers[q.id])
      .map((q) => q.id);

    if (unanswered.length > 0) {
      setMissing(new Set(unanswered));
      document
        .getElementById(`question-${unanswered[0]}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    const result = await submitPollResponse({
      pollId,
      answers: Object.entries(answers).map(([questionId, optionId]) => ({
        questionId,
        optionId,
      })),
    });

    if (result.success) {
      if (onSubmitted) {
        onSubmitted(answers);
      } else {
        setSubmitted(true);
      }
    } else {
      setError(result.error);
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <div className="w-16 h-16 rounded-full bg-tertiary-container flex items-center justify-center mb-stack-md">
          <Icon
            name="check_circle"
            filled
            className="text-on-tertiary-container text-[32px]"
          />
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
          Thank you for your response!
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-[420px]">
          Your feedback has been recorded. You can safely close this window.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12" noValidate>
      {questions.map((question, index) => {
        const isMissing = missing.has(question.id);
        return (
          <div
            key={question.id}
            id={`question-${question.id}`}
            className="space-y-4 scroll-mt-24"
          >
            <div className="flex items-start gap-1">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                {index + 1}. {question.title}
              </h2>
              {question.isRequired && (
                <span
                  aria-label="Mandatory"
                  title="Mandatory"
                  className="text-error font-bold"
                >
                  *
                </span>
              )}
            </div>

            {isMissing && (
              <p className="font-label-sm text-label-sm text-error flex items-center gap-1">
                <Icon name="error" className="text-[16px]" />
                This question is required.
              </p>
            )}

            <div className="space-y-3">
              {question.options.map((option) => {
                const checked = answers[question.id] === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex items-center p-4 cursor-pointer rounded-lg border bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-150 shadow-sm relative overflow-hidden group ${
                      checked ? "border-primary"
                      : isMissing ? "border-error/50"
                      : "border-outline-variant hover:border-primary"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={checked}
                      onChange={() => select(question.id, option.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 shrink-0 rounded-full border-2 mr-4 transition-all duration-200 ${
                        checked ?
                          "border-[6px] border-primary"
                        : "border-outline"
                      }`}
                    />
                    <span
                      className={`font-body-md text-body-md text-on-surface ${
                        checked ? "font-medium" : ""
                      }`}
                    >
                      {option.text}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="pt-8 border-t border-outline-variant flex flex-col gap-4">
        {error && (
          <p className="font-label-sm text-label-sm text-error flex items-center gap-1">
            <Icon name="error" className="text-[16px]" />
            {error}
          </p>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {authenticatedOnly && (
            <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
              <Icon name="lock" className="text-[16px]" />
              Authentication required
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="sm:ml-auto bg-primary text-on-primary font-label-sm text-label-sm px-8 py-3.5 rounded-lg hover:bg-primary-fixed-dim transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? "Submitting…" : "Submit Response"}
            <Icon name="send" className="text-[18px]" />
          </button>
        </div>
      </div>
    </form>
  );
}
