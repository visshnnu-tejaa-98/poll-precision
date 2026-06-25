"use client";

import { Icon } from "@/app/_components/Icon";
import { useId } from "react";

type Props = {
  title: string;
  description: string;
  onTitleChange: (next: string) => void;
  onDescriptionChange: (next: string) => void;
};

export function GeneralInfoCard({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: Props) {
  const titleId = useId();
  const descId = useId();
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-md flex items-center gap-2">
        <Icon name="info" className="text-primary" />
        General Information
      </h3>
      <div className="space-y-stack-md">
        <div>
          <label
            htmlFor={titleId}
            className="block font-label-sm text-label-sm text-on-surface mb-unit"
          >
            Poll Title
          </label>
          <input
            id={titleId}
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g., Q3 Employee Satisfaction Survey"
            className="w-full bg-surface-bright border border-outline rounded-lg px-4 py-2 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant"
          />
        </div>
        <div>
          <label
            htmlFor={descId}
            className="block font-label-sm text-label-sm text-on-surface mb-unit"
          >
            Description
          </label>
          <textarea
            id={descId}
            rows={3}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Briefly describe the purpose of this poll..."
            className="w-full bg-surface-bright border border-outline rounded-lg px-4 py-2 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant resize-none"
          />
        </div>
      </div>
    </div>
  );
}
