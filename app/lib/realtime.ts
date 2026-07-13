import "server-only";
import { io as ioClient, type Socket } from "socket.io-client";

// Why a client here? Next.js (Turbopack) runs Server Actions in a different
// module/global context than the custom server.js process, so `globalThis.io`
// set in server.js is NOT visible here. Instead we open one persistent internal
// socket connection back to our own server and ask it to relay broadcasts to the
// real rooms. server.js handles `internal:relay` (guarded by a shared token).
const PORT = process.env.PORT ?? "3000";
const INTERNAL_URL = `http://127.0.0.1:${PORT}`;
export const RELAY_TOKEN =
  process.env.SOCKET_RELAY_TOKEN ?? "poll-precision-internal-relay";

let emitter: Socket | null = null;

function getEmitter(): Socket {
  if (!emitter) {
    emitter = ioClient(INTERNAL_URL, {
      transports: ["websocket"],
      reconnection: true,
    });
  }
  return emitter;
}

// Emits are buffered by socket.io-client until the connection is established, so
// this is safe to call before the internal socket has finished connecting.
function relay(room: string, event: string, payload: unknown) {
  getEmitter().emit("internal:relay", {
    token: RELAY_TOKEN,
    room,
    event,
    payload,
  });
}

// Notify clients watching a poll's results room that its results changed. The
// payload is minimal — clients re-fetch the authoritative aggregate.
export function broadcastPollResults(pollId: string) {
  relay(pollId, "poll:results", { pollId });
}

// Notify a poll's creator (by Clerk user id) that one of their polls changed, so
// their cross-poll dashboard/my-polls/reports/submissions pages refresh live.
export function broadcastCreatorUpdate(clerkUserId: string) {
  relay(`creator:${clerkUserId}`, "creator:update", {});
}
