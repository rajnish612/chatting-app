import { io } from "socket.io-client";
import { createContext } from "react";
const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});
const SocketContext = createContext();
export default SocketContext;
