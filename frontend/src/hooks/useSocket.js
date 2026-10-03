import { useEffect, useState } from "react";

import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from "../services/socketService";

function useSocket(user) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      setSocket(null);
      setConnected(false);
      return;
    }

    const activeSocket = connectSocket(user);

    if (!activeSocket) {
      return;
    }

    setSocket(activeSocket);
    setConnected(activeSocket.connected);

    const handleConnect = () => {
      setConnected(true);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    activeSocket.on("connect", handleConnect);
    activeSocket.on("disconnect", handleDisconnect);

    return () => {
      activeSocket.off("connect", handleConnect);
      activeSocket.off("disconnect", handleDisconnect);
    };
  }, [user]);

  return {
    socket,
    connected,
    getSocket,
  };
}

export default useSocket;