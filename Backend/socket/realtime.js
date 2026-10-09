// Thin emitter shared by services and the socket layer, so business logic
// can push events without importing the Socket.IO server directly.
let io = null;

export const setIo = (instance) => {
  io = instance;
};

const emit = (room, event, payload) => {
  if (io) io.to(room).emit(event, payload);
};

export const toUser = (userId, event, payload) =>
  emit(`user:${String(userId)}`, event, payload);

export const toCaptain = (captainId, event, payload) =>
  emit(`captain:${String(captainId)}`, event, payload);

export const toRide = (rideId, event, payload) =>
  emit(`ride:${String(rideId)}`, event, payload);
