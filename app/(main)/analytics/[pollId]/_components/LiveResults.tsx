"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { socketInstance } from "@/socket";

// Subscribes to live `poll:results` events for one poll and re-runs the server
// component (router.refresh) so the analytics re-fetch fresh aggregates. This
// page isn't wrapped in SocketProvider, so we drive the shared socket directly.
export function LiveResults({ pollId }: { pollId: string }) {
  const router = useRouter();

  useEffect(() => {
    function join() {
      socketInstance.emit("join:poll", pollId);
    }
    function onResults(data: { pollId: string }) {
      if (data?.pollId === pollId) router.refresh();
    }

    socketInstance.on("connect", join);
    socketInstance.on("poll:results", onResults);

    if (socketInstance.connected) join();
    else socketInstance.connect();

    return () => {
      socketInstance.emit("leave:poll", pollId);
      socketInstance.off("connect", join);
      socketInstance.off("poll:results", onResults);
    };
  }, [pollId, router]);

  return null;
}
