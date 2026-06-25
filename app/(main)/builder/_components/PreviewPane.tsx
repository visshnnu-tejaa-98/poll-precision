"use client";

import { Icon } from "@/app/_components/Icon";
import { useId } from "react";
import type { Question } from "./types";

type Props = {
  title: string;
  description: string;
  questions: Question[];
  authRequired: boolean;
};

export function PreviewPane({
  title,
  description,
  questions,
  authRequired,
}: Props) {
  const groupId = useId();
  return (
    <div className="sticky top-stack-lg border border-outline-variant rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col h-[calc(100vh-120px)]">
      <div className="bg-surface-container-low border-b border-outline-variant px-stack-md py-stack-sm flex items-center gap-2">
        <Icon name="visibility" className="text-on-surface-variant text-sm" />
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          Respondent Preview
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-stack-lg bg-surface-bright">
        <div className="mx-auto max-w-[320px] bg-white border border-outline-variant shadow-lg rounded-2xl overflow-hidden font-body-md">
          <div className="bg-primary px-4 py-8 text-center text-on-primary">
            <h4 className="font-headline-md font-bold mb-1">
              {title || "Untitled poll"}
            </h4>
            <p className="text-sm opacity-80">
              {description || "Briefly describe the purpose of this poll..."}
            </p>
          </div>

          <div className="p-6 space-y-8">
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-4">
                <p className="font-semibold text-on-surface">
                  {index + 1}.{" "}
                  {question.title || (
                    <span className="text-on-surface-variant italic">
                      Untitled question
                    </span>
                  )}
                  {question.required && (
                    <span className="text-error"> *</span>
                  )}
                </p>
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center p-3 border border-outline-variant rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name={`${groupId}-${question.id}`}
                        className="accent-primary border-outline-variant focus:ring-primary/20"
                      />
                      <span className="ml-3 text-on-surface text-sm">
                        {option.text || (
                          <span className="text-on-surface-variant italic">
                            Empty option
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm hover:bg-primary-container transition-colors shadow-md mt-4"
            >
              Submit Response
            </button>

            {authRequired && (
              <p className="text-center text-xs text-on-surface-variant flex items-center justify-center gap-1 mt-4">
                <Icon name="lock" className="text-[14px]" />
                Authentication required
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
