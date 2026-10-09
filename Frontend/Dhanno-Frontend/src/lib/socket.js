import { io } from "socket.io-client";
import { API_BASE } from "./api.js";

/** Socket authenticated by the role's cookie (sent automatically with withCredentials). */
export const createSocket = (role) =>
  io(API_BASE, {
    auth: { role },
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnectionDelayMax: 5000,
  });
