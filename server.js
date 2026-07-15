import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
// Bind to the platform-assigned port (Railway/Render/etc. inject PORT) and to
// all interfaces in production so the container is reachable.
const hostname = process.env.HOSTNAME || (dev ? "localhost" : "0.0.0.0");
const port = parseInt(process.env.PORT || "3000", 10);

console.log(
  `Booting server.js (NODE_ENV=${process.env.NODE_ENV}, PORT=${process.env.PORT ?? "unset→3000"})`,
);
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Shared secret so only our own server-side code can trigger a relay. Keep in
// sync with app/lib/realtime.ts (both read SOCKET_RELAY_TOKEN).
const RELAY_TOKEN =
  process.env.SOCKET_RELAY_TOKEN ?? "poll-precision-internal-relay";

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    // A client viewing a poll's results joins that poll's room so it receives
    // `poll:results` broadcasts when someone submits a response.
    socket.on("join:poll", (pollId) => {
      if (typeof pollId === "string" && pollId) socket.join(pollId);
    });

    socket.on("leave:poll", (pollId) => {
      if (typeof pollId === "string" && pollId) socket.leave(pollId);
    });

    // A creator viewing their dashboard / my-polls / reports joins a room keyed
    // by their Clerk user id, so their cross-poll aggregates refresh live when a
    // response lands on any of their polls.
    socket.on("join:creator", (clerkUserId) => {
      if (typeof clerkUserId === "string" && clerkUserId) {
        socket.join(`creator:${clerkUserId}`);
      }
    });

    socket.on("leave:creator", (clerkUserId) => {
      if (typeof clerkUserId === "string" && clerkUserId) {
        socket.leave(`creator:${clerkUserId}`);
      }
    });

    // Bridge from Next Server Actions (see app/lib/realtime.ts). They can't reach
    // this `io` directly, so they connect as an internal client and ask us to
    // relay an event into a room. Guarded by a shared token.
    socket.on("internal:relay", (msg) => {
      if (!msg || msg.token !== RELAY_TOKEN) return;
      const { room, event, payload } = msg;
      if (typeof room === "string" && typeof event === "string") {
        io.to(room).emit(event, payload ?? {});
      }
    });
  });

  // Bind explicitly to 0.0.0.0 (IPv4, all interfaces). Without this Node may
  // bind IPv6-only inside a container, which makes Railway's proxy report
  // "Application failed to respond".
  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, "0.0.0.0", () => {
      console.log(`> Ready on http://0.0.0.0:${port}`);
    });
}).catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
