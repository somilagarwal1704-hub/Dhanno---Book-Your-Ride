import { validationResult } from "express-validator";
import captainModel from "../models/captain.model.js";
import rideModel from "../models/ride.model.js";
import { createCaptain } from "../services/captain.service.js";
import BlacklistedToken from "../models/blacklistToken.model.js";
import { AUTH_COOKIE, cookieOptions } from "../utils/cookies.js";
import { HttpError } from "../middlewares/error.middleware.js";
import { tokenFor } from "../middlewares/auth.middleware.js";
import { haversineKm } from "../utils/geo.js";

export const registerCaptain = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { fullname, email, password, vehicle } = req.body;
  const normalized = email.toLowerCase().trim();

  if (await captainModel.exists({ email: normalized })) {
    throw new HttpError(400, "Captain with this email already exists");
  }

  const captain = await createCaptain({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email: normalized,
    password: await captainModel.hashPassword(password),
    color: vehicle.color,
    plate: vehicle.plate,
    capacity: vehicle.capacity,
    vehicleType: vehicle.vehicleType,
  });

  const token = captain.generateAuthToken();
  res
    .cookie(AUTH_COOKIE.captain, token, cookieOptions())
    .status(201)
    .json({ message: "Captain registered successfully", captain, token });
};

export const loginCaptain = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const captain = await captainModel
    .findOne({ email: email.toLowerCase().trim() })
    .select("+password");

  if (!captain || !(await captain.comparePassword(password))) {
    throw new HttpError(400, "Invalid email or password");
  }

  const token = captain.generateAuthToken();
  res
    .cookie(AUTH_COOKIE.captain, token, cookieOptions())
    .status(200)
    .json({ message: "Login successful", token, captain });
};

export const captainProfile = async (req, res) => {
  res.status(200).json({ captain: req.captain });
};

export const logoutCaptain = async (req, res) => {
  const token = tokenFor(req, "captain");
  if (token) {
    await BlacklistedToken.updateOne({ token }, { $set: { token } }, { upsert: true });
  }
  res.clearCookie(AUTH_COOKIE.captain, cookieOptions());
  res.status(200).json({ message: "Logout successful" });
};

/** Go online / offline. Going offline is blocked mid-ride so riders aren't stranded. */
export const setCaptainStatus = async (req, res) => {
  const online = Boolean(req.body.online);

  if (!online) {
    const busy = await rideModel.exists({
      captain: req.captain._id,
      status: { $in: ["accepted", "in_progress"] },
    });
    if (busy) throw new HttpError(400, "Finish your current ride before going offline");
  }

  const captain = await captainModel.findByIdAndUpdate(
    req.captain._id,
    { $set: { status: online ? "active" : "inactive" } },
    { new: true },
  );
  res.status(200).json({ captain });
};

/**
 * Captains currently online and recently reporting location, for the rider's map.
 * Only anonymous positions are returned, never names or plates.
 */
export const getNearbyCaptains = async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Math.min(Number(req.query.radius) || 5, 15);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new HttpError(400, "lat and lng are required");
  }

  const freshAfter = new Date(Date.now() - 2 * 60 * 1000);
  const captains = await captainModel
    .find({
      status: "active",
      "location.updatedAt": { $gte: freshAfter },
    })
    .select("vehicle.vehicleType location");

  const nearby = captains
    .map((c) => ({
      id: c._id,
      vehicleType: c.vehicle.vehicleType,
      lat: c.location.lat,
      lng: c.location.long,
      km: haversineKm(lat, lng, c.location.lat, c.location.long),
    }))
    .filter((c) => c.km <= radiusKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, 40)
    .map(({ km, ...rest }) => ({ ...rest, distanceKm: Number(km.toFixed(2)) }));

  res.status(200).json({ captains: nearby });
};
