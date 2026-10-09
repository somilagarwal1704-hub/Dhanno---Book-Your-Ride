import { validationResult } from "express-validator";
import * as rides from "../services/ride.service.js";
import messageModel from "../models/message.model.js";
import { HttpError } from "../middlewares/error.middleware.js";

const checkValid = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new HttpError(400, errors.array()[0].msg, { errors: errors.array() });
};

export const createRideController = async (req, res) => {
  checkValid(req);
  const { pickup, destination, vehicleType, distance, duration, paymentMethod } = req.body;
  const ride = await rides.createRide({
    user: req.user._id,
    pickup,
    destination,
    vehicleType,
    distance,
    duration,
    paymentMethod,
  });
  res.status(201).json(await rides.getRideView(ride._id, { role: "user" }));
};

export const estimateController = async (req, res) => {
  const distanceKm = Number(req.query.distance);
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    throw new HttpError(400, "distance is required");
  }
  const estimate = await rides.estimateFares({
    distanceKm,
    pickupLat: Number(req.query.pickupLat),
    pickupLng: Number(req.query.pickupLng),
  });
  res.status(200).json(estimate);
};

export const activeRideController = async (req, res) => {
  res.status(200).json({ ride: await rides.getActiveRide(req.actor) });
};

export const historyController = async (req, res) => {
  res.status(200).json({ rides: await rides.listRides(req.actor, Number(req.query.limit) || 30) });
};

export const getRideController = async (req, res) => {
  res.status(200).json({ ride: await rides.getRideForActor(req.params.rideId, req.actor) });
};

export const messagesController = async (req, res) => {
  // Reuse the ownership check: throws 403/404 for anyone not in the ride.
  await rides.getRideForActor(req.params.rideId, req.actor);
  const messages = await messageModel
    .find({ ride: req.params.rideId })
    .sort({ createdAt: 1 })
    .limit(200);
  res.status(200).json({ messages });
};

export const acceptController = async (req, res) => {
  res.status(200).json({ ride: await rides.acceptRide(req.params.rideId, req.captain) });
};

export const declineController = async (req, res) => {
  res.status(200).json(await rides.declineRide(req.params.rideId, req.captain));
};

export const startController = async (req, res) => {
  res.status(200).json({ ride: await rides.startRide(req.params.rideId, req.captain, req.body.otp) });
};

export const completeController = async (req, res) => {
  res.status(200).json(
    await rides.completeRide(req.params.rideId, req.captain, {
      switchToCash: Boolean(req.body.switchToCash),
    }),
  );
};

export const cancelController = async (req, res) => {
  const ride = await rides.cancelRide(req.params.rideId, req.actor, req.body.reason);
  res.status(200).json({ ride });
};

export const rateController = async (req, res) => {
  res.status(200).json({
    ride: await rides.rateRide(req.params.rideId, req.user._id, req.body.stars, req.body.comment),
  });
};

export const retryController = async (req, res) => {
  res.status(200).json({ ride: await rides.retryRide(req.params.rideId, req.user._id) });
};

