"use client";

import { Icon } from "@/app/_components/Icon";
import { QuestionItem } from "./QuestionItem";
import { MAX_QUESTIONS, type Question } from "./types";

type Props = {
  questions: Question[];
  onChange: (next: Question[]) => void;
};

export function QuestionsCard({ questions, onChange }: Props) {
  const updateQuestion = (id: string, next: Question) =>
    onChange(questions.map((q) => (q.id === id ? next : q)));

  const removeQuestion = (id: string) =>
    onChange(questions.filter((q) => q.id !== id));

  const addQuestion = () => {
    if (questions.length >= MAX_QUESTIONS) return;
    onChange([
      ...questions,
      {
        id: crypto.randomUUID(),
        title: "",
        type: "single",
        required: false,
        options: [
          { id: crypto.randomUUID(), text: "" },
          { id: crypto.randomUUID(), text: "" },
        ],
      },
    ]);
  };

  const atLimit = questions.length >= MAX_QUESTIONS;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm">
      <div className="flex justify-between items-center mb-stack-md">
        <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
          <Icon name="list_alt" className="text-primary" />
          Questions
        </h3>
        <span className="bg-surface-container-low text-primary font-mono-data text-mono-data px-2 py-1 rounded-md">
          {questions.length}/{MAX_QUESTIONS} limit
        </span>
      </div>

      <div className="space-y-stack-md">
        {questions.map((question, index) => (
          <QuestionItem
            key={question.id}
            question={question}
            index={index}
            onChange={(next) => updateQuestion(question.id, next)}
            onDelete={() => removeQuestion(question.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addQuestion}
        disabled={atLimit}
        className="w-full mt-stack-md py-3 border-2 border-dashed border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:border-primary hover:bg-surface-container-low transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:text-on-surface-variant disabled:hover:border-outline-variant disabled:hover:bg-transparent disabled:cursor-not-allowed"
      >
        <Icon name="add_circle" />
        {atLimit ? "Question limit reached" : "Add Another Question"}
      </button>
    </div>
  );
}
