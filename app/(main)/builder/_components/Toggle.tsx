"use client";

import { useId } from "react";

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
};

export function Toggle({ checked, onChange, label, description }: Props) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant"
    >
      <div>
        <span className="block font-label-sm text-label-sm text-on-surface">
          {label}
        </span>
        {description && (
          <span className="text-xs text-on-surface-variant">{description}</span>
        )}
      </div>
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-outline-variant rounded-full peer-checked:bg-primary transition-colors" />
        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );
}
