import { io } from "socket.io-client";
import { API_BASE } from "./api.js";
import { getToken } from "./session.js";

/** Socket authenticated by the role's token (sent in the handshake, works without cookies). */
export const createSocket = (role) =>
  io(API_BASE, {
    auth: { role, token: getToken(role) },
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnectionDelayMax: 5000,
  });