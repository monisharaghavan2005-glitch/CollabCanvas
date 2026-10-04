import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  window.location.origin;

let socket = null;

const connectSocket = (user) => {
  if (!user) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);

    socket.emit("user:join", {
      id: user.id,
      name: user.name,
      email: user.email,
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error(
      "❌ Socket connection error:",
      error.message
    );
  });

  return socket;
};

const getSocket = () => {
  return socket;
};

const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting socket...");

    socket.disconnect();
    socket = null;
  }
};

export {
  connectSocket,
  getSocket,
  disconnectSocket,
};