"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { socketInstance } from "@/socket";

// Keeps the creator's cross-poll pages (dashboard, my polls, reports) in sync:
// joins a room keyed by the signed-in user's Clerk id and re-runs the server
// component whenever a response lands on any of their polls. These pages aren't
// wrapped in SocketProvider, so we drive the shared socket directly.
export function CreatorLiveRefresh() {
  const router = useRouter();
  const { user } = useUser();
  const clerkUserId = user?.id;

  useEffect(() => {
    if (!clerkUserId) return;

    const join = () => socketInstance.emit("join:creator", clerkUserId);
    const onUpdate = () => router.refresh();

    socketInstance.on("connect", join);
    socketInstance.on("creator:update", onUpdate);

    if (socketInstance.connected) join();
    else socketInstance.connect();

    return () => {
      socketInstance.emit("leave:creator", clerkUserId);
      socketInstance.off("connect", join);
      socketInstance.off("creator:update", onUpdate);
    };
  }, [clerkUserId, router]);

  return null;
}
