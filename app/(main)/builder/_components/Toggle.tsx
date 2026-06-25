"use client";

import { useId } from "react";

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  // Optional numeric field shown below the toggle. When all three are
  // provided, the row renders and fades to disabled when `checked` is false.
  value?: number;
  onValueChange?: (next: number) => void;
  unit?: string;
  min?: number;
};

export function Toggle({
  checked,
  onChange,
  label,
  description,
  value,
  onValueChange,
  unit,
  min = 1,
}: Props) {
  const id = useId();
  const hasUnit =
    value !== undefined && onValueChange !== undefined && unit !== undefined;

  return (
    <div className="p-3 rounded-lg hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant">
      <label
        htmlFor={id}
        className="flex items-center justify-between cursor-pointer"
      >
        <div>
          <span className="block font-label-sm text-label-sm text-on-surface">
            {label}
          </span>
          {description && (
            <span className="text-xs text-on-surface-variant">
              {description}
            </span>
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

      {hasUnit && (
        <div
          className={`flex items-center gap-2 mt-3 transition-opacity ${
            checked ? "opacity-100" : "opacity-50 pointer-events-none"
          }`}
        >
          <input
            type="number"
            min={min}
            value={value}
            onChange={(e) => onValueChange(Number(e.target.value) || 0)}
            className="w-20 bg-surface-container-lowest border border-outline rounded-lg px-2 py-1 font-mono-data text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <span className="text-xs text-on-surface-variant">{unit}</span>
        </div>
      )}
    </div>
  );
}
