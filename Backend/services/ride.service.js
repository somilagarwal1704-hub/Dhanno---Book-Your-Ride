import crypto from "crypto";
import rideModel from "../models/ride.model.js";
import captainModel from "../models/captain.model.js";
import userModel from "../models/user.model.js";
import { HttpError } from "../middlewares/error.middleware.js";
import { toUser, toCaptain } from "../socket/realtime.js";
import { haversineKm, round2 } from "../utils/geo.js";
import { settleRide } from "./transaction.service.js";

// Rates in ₹. ~44 km trip: cab ≈ ₹250, auto ≈ ₹180, bike ≈ ₹110 (before peak surge).
export const FARE_RATES = {
  car: { baseFare: 50, perKm: 10, minFare: 80 },
  bike: { baseFare: 15, perKm: 5, minFare: 30 },
  auto: { baseFare: 25, perKm: 7, minFare: 50 },
};
export const VEHICLE_TYPES = Object.keys(FARE_RATES);

export const ACTIVE_STATUSES = ["pending", "accepted", "in_progress"];
const OFFER_TTL_MS = 15000; // captain has 15s to accept before we move on
const MAX_RETRIES = 3;
const AVG_SPEED_KMH = 25; // used for pickup ETA
const PEAK_SURGE = 1.2;
const PEAK_HOURS = [
  [8, 10],
  [17, 21],
];
const OTP_LENGTH = 4;

// Pending offer timers, keyed by ride id. In-memory: fine for a single server instance.
const offerTimers = new Map();

const clearOfferTimer = (rideId) => {
  const key = String(rideId);
  const timer = offerTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    offerTimers.delete(key);
  }
};

const istHour = (date) =>
  Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(date),
  );

export const surgeMultiplier = (date = new Date()) => {
  const hour = istHour(date);
  return PEAK_HOURS.some(([from, to]) => hour >= from && hour < to) ? PEAK_SURGE : 1;
};

export const computeFare = ({ vehicleType, distanceKm, at = new Date() }) => {
  const rate = FARE_RATES[vehicleType];
  if (!rate) throw new HttpError(400, "Invalid vehicle type");
  const raw = (rate.baseFare + rate.perKm * distanceKm) * surgeMultiplier(at);
  return round2(Math.max(rate.minFare, raw));
};

const getOtp = () => String(crypto.randomInt(10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");

const hasLocation = (captain) =>
  Number.isFinite(captain.location?.lat) && Number.isFinite(captain.location?.long);

const etaMinutes = (km) => Math.max(2, Math.round((km / AVG_SPEED_KMH) * 60));

/** Fare quotes for every vehicle type, plus nearby supply for the pickup point. */
export const estimateFares = async ({ distanceKm, pickupLat, pickupLng }) => {
  const captains = await captainModel
    .find({ status: "active" })
    .select("vehicle.vehicleType location");

  const surge = surgeMultiplier();
  const vehicles = {};

  for (const type of VEHICLE_TYPES) {
    const fleet = captains.filter((c) => c.vehicle?.vehicleType === type);
    const located = fleet.filter(hasLocation);

    let nearestKm = null;
    if (Number.isFinite(pickupLat) && Number.isFinite(pickupLng)) {
      for (const c of located) {
        const d = haversineKm(pickupLat, pickupLng, c.location.lat, c.location.long);
        if (nearestKm === null || d < nearestKm) nearestKm = d;
      }
    }

    vehicles[type] = {
      fare: computeFare({ vehicleType: type, distanceKm }),
      surge,
      availableCount: fleet.length,
      pickupEtaMin: nearestKm === null ? null : etaMinutes(nearestKm),
    };
  }
  return { surge, vehicles };
};

export const createRide = async ({
  user,
  pickup,
  destination,
  vehicleType,
  distance,
  duration,
  paymentMethod = "cash",
}) => {
  if (!VEHICLE_TYPES.includes(vehicleType)) {
    throw new HttpError(400, "Vehicle type must be either car, bike, or auto");
  }

  const distanceKm = Number(distance);
  if (!Number.isFinite(distanceKm) || distanceKm <= 0 || distanceKm > 2000) {
    throw new HttpError(400, "Invalid distance");
  }

  const alreadyActive = await rideModel.exists({
    user,
    status: { $in: ACTIVE_STATUSES },
  });
  if (alreadyActive) {
    throw new HttpError(409, "You already have an active ride");
  }

  const fare = computeFare({ vehicleType, distanceKm });

  if (paymentMethod === "wallet") {
    const rider = await userModel.findById(user).select("wallet");
    const balance = rider?.wallet?.balance ?? 0;
    if (balance < fare) {
      throw new HttpError(
        402,
        `Wallet balance is short by ₹${round2(fare - balance)}. Top up or pay by cash.`,
        { code: "WALLET_INSUFFICIENT" },
      );
    }
  }

  const ride = await rideModel.create({
    user,
    pickup,
    destination,
    vehicleType,
    fare,
    distance: distanceKm,
    duration: Number(duration) || undefined,
    paymentMethod,
    otp: getOtp(),
  });

  dispatchRide(ride._id).catch((err) => console.error("Dispatch failed:", err));
  return ride;
};

/**
 * Offer the ride to the single nearest eligible captain. Captains get a 15s
 * window; a decline or timeout moves the offer to the next nearest captain.
 * Only captains with a live socket connection are considered, since an
 * offer can't be delivered to anyone else.
 */
export const dispatchRide = async (rideId) => {
  const ride = await rideModel.findById(rideId);
  if (!ride || ride.status !== "pending") return null;

  const busyCaptains = await rideModel.distinct("captain", {
    status: { $in: ["accepted", "in_progress"] },
    captain: { $ne: null },
  });
  const excluded = [...ride.rejectedCaptains, ...busyCaptains].map(String);

  const candidates = await captainModel
    .find({
      status: "active",
      socketId: { $ne: null },
      "vehicle.vehicleType": ride.vehicleType,
      _id: { $nin: excluded },
    })
    .select("fullname vehicle location rating");

  if (!candidates.length) {
    await rideModel.updateOne(
      { _id: ride._id, status: "pending" },
      { $set: { noCaptainFound: true }, $unset: { currentOffer: 1 } },
    );
    toUser(ride.user, "ride:no-captain", {
      rideId: ride._id,
      message: "No captain is free right now. You can retry or cancel.",
    });
    return null;
  }

  const { pickup } = ride;
  const ranked = candidates
    .map((captain) => ({
      captain,
      km: hasLocation(captain)
        ? haversineKm(pickup.location.lat, pickup.location.lng, captain.location.lat, captain.location.long)
        : Infinity,
    }))
    .sort((a, b) => a.km - b.km);

  const { captain, km } = ranked[0];
  const expiresAt = new Date(Date.now() + OFFER_TTL_MS);

  await rideModel.updateOne(
    { _id: ride._id, status: "pending" },
    {
      $set: {
        noCaptainFound: false,
        currentOffer: { captain: captain._id, expiresAt, offeredAt: new Date() },
      },
    },
  );

  const rider = await userModel.findById(ride.user).select("fullname");
  toCaptain(captain._id, "ride:offer", {
    rideId: ride._id,
    vehicleType: ride.vehicleType,
    fare: ride.fare,
    distance: ride.distance,
    duration: ride.duration,
    pickup: ride.pickup,
    destination: ride.destination,
    riderName: rider?.fullname?.firstname ?? "Rider",
    pickupDistanceKm: Number.isFinite(km) ? round2(km) : null,
    pickupEtaMin: Number.isFinite(km) ? etaMinutes(km) : null,
    expiresAt,
  });
  toUser(ride.user, "ride:searching", {
    rideId: ride._id,
    message: "Contacting a nearby captain...",
  });

  clearOfferTimer(ride._id);
  offerTimers.set(
    String(ride._id),
    setTimeout(() => {
      offerTimers.delete(String(ride._id));
      handleOfferExpired(ride._id, captain._id).catch((err) =>
        console.error("Offer timeout failed:", err),
      );
    }, OFFER_TTL_MS),
  );

  return ride;
};

const passOffer = async (rideId, captainId, reason) => {
  await rideModel.updateOne(
    { _id: rideId, status: "pending", "currentOffer.captain": captainId },
    {
      $addToSet: { rejectedCaptains: captainId },
      $unset: { currentOffer: 1 },
    },
  );
  toCaptain(captainId, "ride:offer-closed", { rideId, reason });
  return dispatchRide(rideId);
};

const handleOfferExpired = async (rideId, captainId) => {
  const ride = await rideModel.findById(rideId).select("status currentOffer");
  if (!ride || ride.status !== "pending") return;
  if (String(ride.currentOffer?.captain) !== String(captainId)) return;
  await passOffer(rideId, captainId, "timeout");
};

export const acceptRide = async (rideId, captain) => {
  const busy = await rideModel.exists({
    captain: captain._id,
    status: { $in: ["accepted", "in_progress"] },
  });
  if (busy) throw new HttpError(409, "You already have an active ride");

  // Atomic: only succeeds if this captain still holds the live offer.
  const ride = await rideModel
    .findOneAndUpdate(
      {
        _id: rideId,
        status: "pending",
        "currentOffer.captain": captain._id,
      },
      {
        $set: { captain: captain._id, status: "accepted", acceptedAt: new Date() },
        $unset: { currentOffer: 1 },
      },
      { new: true },
    )
    .select("+otp");

  if (!ride) {
    throw new HttpError(409, "This ride is no longer available");
  }

  clearOfferTimer(ride._id);
  const view = await getRideView(ride._id, { role: "user" });
  toUser(ride.user, "ride:accepted", view);
  toCaptain(captain._id, "ride:accepted", await getRideView(ride._id, { role: "captain" }));
  return view;
};

export const declineRide = async (rideId, captain) => {
  clearOfferTimer(rideId);
  const ride = await rideModel.findById(rideId).select("status currentOffer");
  if (!ride || ride.status !== "pending") {
    throw new HttpError(409, "This ride is no longer available");
  }
  if (String(ride.currentOffer?.captain) !== String(captain._id)) {
    throw new HttpError(409, "This offer is no longer yours");
  }
  await passOffer(rideId, captain._id, "declined");
  return { message: "Offer declined" };
};

export const retryRide = async (rideId, userId) => {
  const ride = await rideModel.findOne({ _id: rideId, user: userId });
  if (!ride) throw new HttpError(404, "Ride not found");
  if (ride.status !== "pending") {
    throw new HttpError(400, "Only pending rides can be retried");
  }
  if (ride.currentOffer?.expiresAt && ride.currentOffer.expiresAt > new Date()) {
    throw new HttpError(409, "A captain is still reviewing this ride. Please wait a moment.");
  }
  if (ride.matchAttempts >= MAX_RETRIES) {
    throw new HttpError(409, "Maximum retry attempts reached. Please book a new ride.");
  }

  await rideModel.updateOne(
    { _id: rideId },
    { $inc: { matchAttempts: 1 }, $set: { rejectedCaptains: [] } },
  );
  await dispatchRide(rideId);
  return getRideView(rideId, { role: "user" });
};

const loadOwnedRide = async (rideId, actor, { requireCaptain = false } = {}) => {
  const ride = await rideModel.findById(rideId).select("+otp");
  if (!ride) throw new HttpError(404, "Ride not found");
  const isOwner =
    actor.role === "user"
      ? String(ride.user) === actor.id
      : String(ride.captain) === actor.id;
  if (!isOwner) throw new HttpError(403, "You are not part of this ride");
  if (requireCaptain && actor.role !== "captain") {
    throw new HttpError(403, "Only the captain can do this");
  }
  return ride;
};

export const startRide = async (rideId, captain, otp) => {
  const ride = await loadOwnedRide(rideId, { role: "captain", id: String(captain._id) }, { requireCaptain: true });
  if (ride.status !== "accepted") {
    throw new HttpError(400, "This ride can't be started right now");
  }
  if (String(ride.otp) !== String(otp ?? "").trim()) {
    throw new HttpError(400, "Invalid OTP. Ask the rider for the code shown in their app.");
  }

  ride.status = "in_progress";
  ride.startedAt = new Date();
  ride.otpVerified = true;
  await ride.save();

  const userView = await getRideView(ride._id, { role: "user" });
  toUser(ride.user, "ride:started", userView);
  toCaptain(captain._id, "ride:started", await getRideView(ride._id, { role: "captain" }));
  return userView;
};

export const completeRide = async (rideId, captain, { switchToCash = false } = {}) => {
  const ride = await loadOwnedRide(rideId, { role: "captain", id: String(captain._id) }, { requireCaptain: true });
  if (ride.status !== "in_progress") {
    throw new HttpError(400, "Only rides in progress can be completed");
  }

  const paymentMethod = switchToCash ? "cash" : ride.paymentMethod;
  const receipt = await settleRide({ ride, paymentMethod });

  ride.paymentMethod = paymentMethod;
  ride.paymentStatus = "paid";
  ride.finalFare = receipt.fare;
  ride.status = "completed";
  ride.completedAt = new Date();
  await ride.save();

  const userView = await getRideView(ride._id, { role: "user" });
  toUser(ride.user, "ride:completed", { ...userView, receipt });
  toCaptain(captain._id, "ride:completed", {
    ...(await getRideView(ride._id, { role: "captain" })),
    receipt,
  });
  return { ride: userView, receipt };
};

export const cancelRide = async (rideId, actor, reason) => {
  const ride = await loadOwnedRide(rideId, actor);

  if (actor.role === "user") {
    if (!["pending", "accepted"].includes(ride.status)) {
      throw new HttpError(400, "This ride can no longer be cancelled");
    }
  } else if (ride.status !== "accepted") {
    throw new HttpError(400, "You can only cancel before starting the ride");
  }

  const previousOffer = ride.currentOffer?.captain;
  clearOfferTimer(ride._id);

  await rideModel.updateOne(
    { _id: ride._id },
    {
      $set: {
        status: "cancelled",
        cancelledBy: actor.role,
        cancelReason: reason?.trim() || `Cancelled by ${actor.role}`,
        cancelledAt: new Date(),
      },
      $unset: { currentOffer: 1 },
    },
  );

  if (previousOffer) {
    toCaptain(previousOffer, "ride:offer-closed", { rideId: ride._id, reason: "cancelled" });
  }

  const message =
    actor.role === "user" ? "The rider cancelled this ride." : "The captain cancelled this ride.";
  if (actor.role === "user" && ride.captain) {
    toCaptain(ride.captain, "ride:cancelled", { rideId: ride._id, message });
  }
  if (actor.role === "captain") {
    toUser(ride.user, "ride:cancelled", { rideId: ride._id, message });
  }

  return getRideView(ride._id, actor);
};

export const rateRide = async (rideId, userId, stars, comment = "") => {
  const score = Number(stars);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw new HttpError(400, "Rating must be a whole number from 1 to 5");
  }

  const ride = await rideModel.findOneAndUpdate(
    {
      _id: rideId,
      user: userId,
      status: "completed",
      "rating.stars": { $exists: false },
    },
    {
      $set: {
        rating: {
          stars: score,
          comment: String(comment).trim().slice(0, 300),
          ratedAt: new Date(),
        },
      },
    },
    { new: true },
  );
  if (!ride) throw new HttpError(400, "This ride can't be rated");

  if (ride.captain) {
    const captain = await captainModel.findById(ride.captain);
    if (captain) {
      const count = (captain.rating?.count ?? 0) + 1;
      const total = (captain.rating?.average ?? 0) * (count - 1) + score;
      captain.rating = { average: round2(total / count), count };
      await captain.save();
    }
  }
  return getRideView(ride._id, { role: "user" });
};

/** Strip fields a viewer shouldn't see. Only the rider gets the OTP. */
const sanitize = (ride, role) => {
  const obj = ride.toObject ? ride.toObject() : { ...ride };
  if (role !== "user") delete obj.otp;
  delete obj.rejectedCaptains;
  delete obj.currentOffer;
  delete obj.__v;
  return obj;
};

export const getRideView = async (rideId, viewer) => {
  const ride = await rideModel
    .findById(rideId)
    .select("+otp")
    .populate("user", "fullname")
    .populate("captain", "fullname vehicle rating location");
  if (!ride) return null;
  return sanitize(ride, viewer.role);
};

export const getRideForActor = async (rideId, actor) => {
  const ride = await loadOwnedRide(rideId, actor);
  return sanitize(
    await rideModel
      .findById(ride._id)
      .select("+otp")
      .populate("user", "fullname")
      .populate("captain", "fullname vehicle rating location"),
    actor.role,
  );
};

export const getActiveRide = async (actor) => {
  const filter =
    actor.role === "user"
      ? { user: actor.id, status: { $in: ACTIVE_STATUSES } }
      : { captain: actor.id, status: { $in: ["accepted", "in_progress"] } };
  const ride = await rideModel.findOne(filter).sort({ createdAt: -1 }).select("_id");
  return ride ? getRideForActor(ride._id, actor) : null;
};

export const listRides = async (actor, limit = 30) => {
  const filter = actor.role === "user" ? { user: actor.id } : { captain: actor.id };
  const rides = await rideModel
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 100))
    .populate("captain", "fullname vehicle.vehicleType");
  return rides.map((r) => sanitize(r, actor.role));
};
