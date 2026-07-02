import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Socket Connected", { socketId: socket.id });

    socket.emit("message", "Hello from server");

    // Echo client pings back so the round-trip is visible on the client.
    socket.on("message", (data) => {
      console.log("message from client:", data);
      socket.emit("message", `Echo: ${data}`);
    });

    socket.on("select:option", (data) => {
      console.log("select:option from client:", data);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
