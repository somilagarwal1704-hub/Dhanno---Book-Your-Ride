import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import captainModel from "../models/captain.model.js";
import rideModel from "../models/ride.model.js";
import messageModel from "../models/message.model.js";
import BlacklistedToken from "../models/blacklistToken.model.js";
import { setIo } from "./realtime.js";
import { AUTH_COOKIE, readCookie } from "../utils/cookies.js";
import { CLIENT_ORIGIN, JWT_SECRET } from "../utils/config.js";
import { isValidLatLng } from "../utils/geo.js";

/**
 * Real-time layer. Lifecycle changes (accept, start, complete, cancel) go
 * through REST so they're authoritative; this socket carries the push
 * notifications plus the high-frequency traffic: chat, typing, live location.
 *
 * Every connection is authenticated with the role's JWT cookie before it can
 * join any room. Clients never supply their own identity.
 */

const windows = new Map(); // socket.id -> Map(event -> { count, resetAt })

const allow = (socket, event, limit, windowMs) => {
  const now = Date.now();
  const perSocket = windows.get(socket.id) ?? new Map();
  windows.set(socket.id, perSocket);
  const entry = perSocket.get(event) ?? { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  perSocket.set(event, entry);
  return entry.count <= limit;
};

const displayName = (doc) => doc?.fullname?.firstname ?? "Rider";

const socketSetup = (server) => {
  const io = new Server(server, {
    cors: { origin: CLIENT_ORIGIN, credentials: true },
  });
  setIo(io);

  // A restart leaves stale socket ids behind; clear them so offers only go to live captains.
  captainModel.updateMany({ socketId: { $ne: null } }, { $set: { socketId: null } }).catch(() => {});
  userModel.updateMany({ socketId: { $ne: null } }, { $set: { socketId: null } }).catch(() => {});

  io.use(async (socket, next) => {
    try {
      const role = socket.handshake.auth?.role === "captain" ? "captain" : "user";
      const token =
        readCookie(socket.handshake.headers.cookie, AUTH_COOKIE[role]) ||
        socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication failed"));
      if (await BlacklistedToken.exists({ token })) {
        return next(new Error("Authentication failed"));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role && decoded.role !== role) {
        return next(new Error("Authentication failed"));
      }

      const Model = role === "captain" ? captainModel : userModel;
      const doc = await Model.findById(decoded._id).select("fullname");
      if (!doc) return next(new Error("Authentication failed"));

      socket.data = { role, id: doc._id.toString(), name: displayName(doc) };
      return next();
    } catch {
      return next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const { role, id, name } = socket.data;
    const Model = role === "captain" ? captainModel : userModel;

    socket.join(`${role}:${id}`);
    Model.updateOne({ _id: id }, { $set: { socketId: socket.id } }).catch(() => {});

    // Join a ride's room (chat + live location) only if this account is a party to it.
    socket.on("ride:join", async ({ rideId } = {}, ack) => {
      try {
        const ride = await rideModel.findById(rideId).select("user captain");
        const isParty =
          ride &&
          (role === "user" ? String(ride.user) === id : String(ride.captain) === id);
        if (!isParty) return ack?.({ ok: false, message: "Not allowed" });
        socket.join(`ride:${ride._id}`);
        return ack?.({ ok: true });
      } catch {
        return ack?.({ ok: false, message: "Could not join ride" });
      }
    });

    socket.on("ride:leave", ({ rideId } = {}) => {
      socket.leave(`ride:${rideId}`);
    });

    socket.on("chat:send", async ({ rideId, text } = {}, ack) => {
      try {
        if (!allow(socket, "chat", 20, 10000)) {
          return ack?.({ ok: false, message: "You're sending messages too fast." });
        }
        if (!socket.rooms.has(`ride:${rideId}`)) {
          return ack?.({ ok: false, message: "Join the ride chat first." });
        }

        const clean = String(text ?? "").trim().slice(0, 500);
        if (!clean) return ack?.({ ok: false, message: "Message is empty." });

        const ride = await rideModel.findById(rideId).select("status");
        if (!ride || !["accepted", "in_progress"].includes(ride.status)) {
          return ack?.({ ok: false, message: "Chat is available during an active ride." });
        }

        const saved = await messageModel.create({
          ride: ride._id,
          senderRole: role,
          sender: id,
          senderName: name,
          text: clean,
        });

        const payload = {
          _id: saved._id,
          rideId: String(ride._id),
          senderRole: role,
          senderName: name,
          text: saved.text,
          createdAt: saved.createdAt,
        };
        io.to(`ride:${ride._id}`).emit("chat:message", payload);
        return ack?.({ ok: true, message: payload });
      } catch (err) {
        console.error("chat:send failed:", err);
        return ack?.({ ok: false, message: "Message could not be sent." });
      }
    });

    socket.on("chat:typing", ({ rideId, typing } = {}) => {
      if (!socket.rooms.has(`ride:${rideId}`)) return;
      socket.to(`ride:${rideId}`).emit("chat:typing", {
        rideId,
        senderRole: role,
        senderName: name,
        typing: Boolean(typing),
      });
    });

    // Captain pushes GPS. Stored as the captain's last-known position (used for
    // dispatch and the rider map) and relayed to the rider if a ride is active.
    socket.on("captain:location", async ({ lat, lng } = {}) => {
      if (role !== "captain") return;
      const la = Number(lat);
      const ln = Number(lng);
      if (!isValidLatLng(la, ln) || !allow(socket, "location", 1, 2000)) return;

      try {
        await captainModel.updateOne(
          { _id: id },
          { $set: { location: { lat: la, long: ln, updatedAt: new Date() } } },
        );
        const ride = await rideModel
          .findOne({ captain: id, status: { $in: ["accepted", "in_progress"] } })
          .select("_id");
        if (ride) {
          io.to(`ride:${ride._id}`).emit("captain:location", {
            rideId: String(ride._id),
            lat: la,
            lng: ln,
            at: new Date(),
          });
        }
      } catch (err) {
        console.error("captain:location failed:", err);
      }
    });

    socket.on("disconnect", () => {
      windows.delete(socket.id);
      Model.updateOne({ _id: id, socketId: socket.id }, { $set: { socketId: null } }).catch(() => {});
    });
  });

  return io;
};

export default socketSetup;
