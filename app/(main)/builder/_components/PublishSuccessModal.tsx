"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/app/_components/Icon";

type Props = {
  pollId: string;
};

export function PublishSuccessModal({ pollId }: Props) {
  const router = useRouter();
  const [link] = useState(() =>
    typeof window !== "undefined"
      ? `${window.location.origin}/poll/${pollId}`
      : "",
  );
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-margin-mobile bg-on-surface/40 backdrop-blur-sm">
      <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xl p-stack-lg">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-tertiary-container flex items-center justify-center mb-stack-md">
            <Icon
              name="check_circle"
              filled
              className="text-on-tertiary-container text-[28px]"
            />
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
            Poll published!
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Share this link to start collecting responses.
          </p>
        </div>

        <div className="mt-stack-lg flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-1 pl-3">
          <input
            type="text"
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 bg-transparent font-body-md text-body-md text-on-surface outline-none truncate"
          />
          <button
            type="button"
            onClick={copy}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-label-sm text-label-sm rounded-md hover:bg-primary-fixed-dim transition-colors"
          >
            <Icon name={copied ? "check" : "content_copy"} className="text-[18px]" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mt-stack-lg flex flex-col sm:flex-row gap-3">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2.5 border border-outline text-on-surface font-label-sm text-label-sm rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="open_in_new" className="text-[18px]" />
            View poll
          </a>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex-1 px-4 py-2.5 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg hover:bg-primary-fixed-dim transition-colors shadow-sm"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
