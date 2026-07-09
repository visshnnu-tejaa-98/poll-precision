import type { ReactNode } from "react";

/**
 * Simple CSS-only tooltip. Wraps a trigger and shows `label` above it on hover
 * / keyboard focus. No JS state, no portal.
 */
export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span className="relative inline-flex group/tooltip">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-inverse-surface px-2 py-1 text-xs font-medium text-inverse-on-surface opacity-0 shadow-md transition-opacity duration-150 z-30 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
