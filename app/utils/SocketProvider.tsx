"use client";

import { socketInstance } from "@/socket";
import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  transport: string;
  lastMessage: string;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  transport: "N/A",
  lastMessage: "",
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [lastMessage, setLastMessage] = useState("");

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setTransport(socketInstance.io.engine.transport.name);
      socketInstance.io.engine.on("upgrade", (t) => setTransport(t.name));
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    function onMessage(data: string) {
      console.log("message from server:", data);
      setLastMessage(data);
    }

    // Attach every listener BEFORE connecting, so the server's immediate
    // "message" emit on connection is never missed.
    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);
    socketInstance.on("message", onMessage);

    socketInstance.connect();

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      socketInstance.off("message", onMessage);
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket: socketInstance, isConnected, transport, lastMessage }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
