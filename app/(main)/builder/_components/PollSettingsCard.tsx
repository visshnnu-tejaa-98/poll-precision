"use client";

import { Icon } from "@/app/_components/Icon";
import { useId } from "react";
import { Toggle } from "./Toggle";
import type { PollSettings } from "./types";

type Props = {
  settings: PollSettings;
  onChange: (next: PollSettings) => void;
};

export function PollSettingsCard({ settings, onChange }: Props) {
  const expiryId = useId();
  const update = <K extends keyof PollSettings>(
    key: K,
    value: PollSettings[K],
  ) => onChange({ ...settings, [key]: value });

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-md flex items-center gap-2">
        <Icon name="settings_applications" className="text-primary" />
        Poll Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        <div className="space-y-stack-sm">
          <Toggle
            label="Anonymous Responses"
            description="Hide respondent identities"
            checked={settings.anonymousResponses}
            onChange={(v) => update("anonymousResponses", v)}
          />
          <Toggle
            label="Authenticated Only"
            description="Require login to vote"
            checked={settings.authenticatedOnly}
            onChange={(v) => update("authenticatedOnly", v)}
          />
          <Toggle
            label="Results Visibility"
            description="Show results to respondents"
            checked={settings.resultsVisibility}
            onChange={(v) => update("resultsVisibility", v)}
          />
        </div>

        <div className="space-y-stack-sm">
          <div className="p-3 border border-outline-variant rounded-lg bg-surface-bright h-fit">
            <label
              htmlFor={expiryId}
              className="block font-label-sm text-label-sm text-on-surface mb-unit"
            >
              Expiry Date &amp; Time
            </label>
            <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Icon
                name="calendar_today"
                className="text-outline-variant text-sm"
              />
              <input
                id={expiryId}
                type="datetime-local"
                value={settings.expiresAt}
                onChange={(e) => update("expiresAt", e.target.value)}
                className="w-full bg-transparent border-none p-0 font-body-md text-on-surface text-sm focus:ring-0 outline-none"
              />
            </div>
            <p className="text-xs text-on-surface-variant mt-2">
              Poll will close automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
