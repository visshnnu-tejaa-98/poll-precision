"use client";

import { Icon } from "@/app/_components/Icon";
import { Toggle } from "./Toggle";
import type { AdvancedSettings } from "./types";

type Props = {
  advanced: AdvancedSettings;
  onChange: (next: AdvancedSettings) => void;
};

export function AdvancedSettingsCard({ advanced, onChange }: Props) {
  const update = <K extends keyof AdvancedSettings>(
    key: K,
    value: AdvancedSettings[K],
  ) => onChange({ ...advanced, [key]: value });

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-md flex items-center gap-2">
        <Icon name="tune" className="text-primary" />
        Advanced Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        <div className="space-y-stack-sm">
          <Toggle
            label="Allow Response Editing"
            description="Respondents can change answers"
            checked={advanced.allowResponseEditing}
            onChange={(v) => update("allowResponseEditing", v)}
          />

          <div className="p-3 rounded-lg border border-transparent hover:border-outline-variant hover:bg-surface-container-low transition-colors">
            <div className="flex items-center justify-between mb-2">
              <Toggle
                label="Response Timer"
                description="Enforce a time limit"
                checked={advanced.timerEnabled}
                onChange={(v) => update("timerEnabled", v)}
              />
            </div>
            <div
              className={`flex items-center gap-2 mt-2 transition-opacity ${
                advanced.timerEnabled ? "opacity-100" : (
                  "opacity-50 pointer-events-none"
                )
              }`}
            >
              <input
                type="number"
                min={1}
                value={advanced.timerMinutes}
                onChange={(e) =>
                  update("timerMinutes", Number(e.target.value) || 0)
                }
                className="w-20 bg-surface-container-lowest border border-outline rounded-lg px-2 py-1 font-mono-data text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <span className="text-xs text-on-surface-variant">minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
