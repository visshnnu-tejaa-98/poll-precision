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

      <div className="grid grid-cols-1 md:grid-cols-1 gap-stack-md">
        <div className="space-y-stack-sm">
          <Toggle
            label="Allow Response Editing"
            description="Respondents can change answers"
            checked={advanced.allowResponseEditing}
            onChange={(v) => update("allowResponseEditing", v)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-stack-md">
        <div className="space-y-stack-sm">
          <Toggle
            label="Response Timer"
            description="Enforce a time limit, This will override the expire date and time in poll settings"
            checked={advanced.timerEnabled}
            onChange={(v) => update("timerEnabled", v)}
            value={advanced.timerMinutes}
            onValueChange={(v) => update("timerMinutes", v)}
            unit="minutes"
            min={1}
          />
        </div>
      </div>
    </div>
  );
}
