import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../api/client";
import { getStoredToken } from "../api/auth.storage";

let sharedSocket = null;
let socketRefCount = 0;

function getSocket(token) {
  if (!sharedSocket || sharedSocket.disconnected) {
    const url = API_BASE_URL || window.location.origin;
    sharedSocket = io(url, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });
  }
  return sharedSocket;
}

export function useSocket(onMessage) {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    const socket = getSocket(token);
    socketRefCount++;

    const handler = (...args) => handlerRef.current?.(...args);
    socket.on("chat:message", handler);

    return () => {
      socket.off("chat:message", handler);
      socketRefCount--;
      if (socketRefCount <= 0 && sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
        socketRefCount = 0;
      }
    };
  }, []);
}
