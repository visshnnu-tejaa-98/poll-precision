"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/app/_components/Icon";

function format(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return days > 0 ? `${days}d ${clock}` : clock;
}

export function PollCountdown({ expiresAt }: { expiresAt: string }) {
  const target = new Date(expiresAt).getTime();
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, target - Date.now()),
  );

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const closed = remaining <= 0;

  return (
    <div
      className={`inline-flex shrink-0 items-center gap-2 px-4 py-2 rounded-lg font-label-sm text-label-sm shadow-sm ${
        closed
          ? "bg-surface-container text-on-surface-variant"
          : "bg-error-container text-on-error-container"
      }`}
    >
      <Icon name="timer" className="text-[18px]" />
      {closed ? "Closed" : `Closes in ${format(remaining)}`}
    </div>
  );
}
