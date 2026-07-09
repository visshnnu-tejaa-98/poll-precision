"use client";

import { useState } from "react";
import { Icon } from "@/app/_components/Icon";
import { useToast } from "@/app/_components/Toast";
import { publishPollResults } from "@/app/actions/poll";

export function AnalyticsActions({
  pollId,
  published,
}: {
  pollId: string;
  published: boolean;
}) {
  const { notify } = useToast();
  const [isPublished, setIsPublished] = useState(published);
  const [busy, setBusy] = useState(false);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/poll/${pollId}`,
      );
      notify("Poll link copied to clipboard", "success");
    } catch {
      notify("Couldn't copy the link", "error");
    }
  };

  const publish = async () => {
    if (busy || isPublished) return;
    setBusy(true);
    const res = await publishPollResults(pollId);
    if (res.success) {
      setIsPublished(true);
      notify("Results published", "success");
    } else {
      notify(res.error ?? "Something went wrong", "error");
    }
    setBusy(false);
  };

  return (
    <div className="flex items-center gap-3 w-full md:w-auto">
      <button
        type="button"
        onClick={share}
        className="flex-1 md:flex-none border border-outline bg-surface text-on-surface font-label-sm text-label-sm px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
      >
        <Icon name="share" className="text-[18px]" />
        Share
      </button>
      <button
        type="button"
        onClick={publish}
        disabled={busy || isPublished}
        className="flex-1 md:flex-none bg-primary text-on-primary font-label-sm text-label-sm px-6 py-2 rounded-lg hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Icon name={isPublished ? "check_circle" : "public"} className="text-[18px]" />
        {isPublished ? "Results Published" : "Publish Results"}
      </button>
    </div>
  );
}
