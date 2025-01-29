import React, { useEffect, useRef, useState, createContext } from "react";
import io, { Socket } from "socket.io-client";

interface SocketContextProps {
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const useSocket = () => {
  const context = React.useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null); // State for reactivity

  useEffect(() => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.log("🔌 Connecting to server...");
      const newSocket = io("http://localhost:5000", {
        transports: ["websocket"],
        reconnection: true,
      });

      socketRef.current = newSocket;
      setSocket(newSocket); // Update state so React re-renders

      newSocket.on("connect", () => console.log("✅ Connected to server"));
      newSocket.on("disconnect", (reason) => console.log("❌ Disconnected:", reason));
      newSocket.on("connect_error", (error) => console.error("⚠️ Connection error:", error));
      newSocket.on("reconnect_attempt", () => console.log("🔄 Reconnecting..."));
      newSocket.on("reconnect_failed", () => console.error("❌ Reconnect failed"));
      newSocket.on("reconnect_error", (error) => console.error("⚠️ Reconnect error:", error));
    }

    return () => {
      socketRef.current?.disconnect();
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};