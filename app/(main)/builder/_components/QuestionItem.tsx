"use client";

import { Icon } from "@/app/_components/Icon";
import type { Question, QuestionType } from "./types";

type Props = {
  question: Question;
  index: number;
  onChange: (next: Question) => void;
  onDelete: () => void;
};

export function QuestionItem({ question, index, onChange, onDelete }: Props) {
  const updateTitle = (title: string) => onChange({ ...question, title });
  const updateType = (type: QuestionType) => onChange({ ...question, type });
  const updateRequired = (required: boolean) =>
    onChange({ ...question, required });

  const updateOption = (optionId: string, text: string) =>
    onChange({
      ...question,
      options: question.options.map((o) =>
        o.id === optionId ? { ...o, text } : o,
      ),
    });

  const addOption = () =>
    onChange({
      ...question,
      options: [
        ...question.options,
        { id: crypto.randomUUID(), text: "" },
      ],
    });

  const removeOption = (optionId: string) =>
    onChange({
      ...question,
      options: question.options.filter((o) => o.id !== optionId),
    });

  return (
    <div className="border border-outline-variant rounded-lg p-stack-md bg-surface-bright relative group">
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete question"
          className="text-on-surface-variant hover:text-error transition-colors"
        >
          <Icon name="delete" />
        </button>
      </div>

      <div className="mb-stack-sm flex items-center gap-4">
        <span className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-sm text-label-sm">
          {index + 1}
        </span>
        <div className="flex-1">
          <input
            type="text"
            value={question.title}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="Enter your question..."
            className="w-full bg-transparent border-b border-outline-variant px-0 py-2 font-body-md text-on-surface focus:border-primary focus:ring-0 outline-none transition-colors placeholder:text-outline-variant"
          />
        </div>
      </div>

      <div className="pl-10 space-y-2 mt-stack-sm">
        {question.options.map((option) => (
          <div key={option.id} className="flex items-center gap-3">
            <Icon
              name="radio_button_unchecked"
              className="text-outline-variant"
            />
            <input
              type="text"
              value={option.text}
              onChange={(e) => updateOption(option.id, e.target.value)}
              placeholder="Option text"
              className="flex-1 bg-transparent border border-outline-variant rounded-lg px-3 py-1.5 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
            />
            <button
              type="button"
              onClick={() => removeOption(option.id)}
              aria-label="Remove option"
              className="text-outline-variant hover:text-error"
            >
              <Icon name="close" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addOption}
          className="w-full flex items-center gap-3 text-left"
        >
          <Icon name="add" className="text-primary" />
          <span className="flex-1 bg-transparent border border-dashed border-outline-variant rounded-lg px-3 py-1.5 font-body-md text-outline-variant text-sm hover:border-primary hover:text-primary transition-colors">
            Add option
          </span>
        </button>
      </div>

      <div className="mt-stack-md pl-10 flex items-center justify-between border-t border-outline-variant pt-stack-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => updateRequired(e.target.checked)}
            className="accent-primary rounded-lg border-outline-variant focus:ring-primary/20"
          />
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Mandatory
          </span>
        </label>
        <select
          value={question.type}
          onChange={(e) => updateType(e.target.value as QuestionType)}
          className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 font-label-sm text-label-sm text-on-surface focus:border-primary outline-none"
        >
          <option value="single">Single Choice</option>
          <option value="multiple">Multiple Choice</option>
          <option value="text">Text Input</option>
        </select>
      </div>
    </div>
  );
}
