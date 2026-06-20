import crypto from "crypto";
import rideModel from "../models/ride.model.js";

const FARE_RATES = {
  car: { baseFare: 50, perKm: 18 },
  bike: { baseFare: 20, perKm: 6 },
  auto: { baseFare: 30, perKm: 10 },
};

const toRadians = (deg) => (deg * Math.PI) / 180;

function computeDistanceKm(pickup, destination) {
  if (
    !Array.isArray(pickup) ||
    !Array.isArray(destination) ||
    pickup.length !== 2 ||
    destination.length !== 2
  ) {
    throw new Error("Invalid coordinates");
  }

  const [lat1, lon1] = pickup;
  const [lat2, lon2] = destination;

  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((R * c).toFixed(2));
}

export async function getFare({ vehicleType, distance, pickup, destination }) {
  if (!vehicleType) throw new Error("vehicleType is required");

  const rate = FARE_RATES[vehicleType.toLowerCase()];
  if (!rate) throw new Error("Invalid vehicle type");

  let distanceKm = distance;

  // fallback: calculate from coordinates
  if (!distanceKm && pickup && destination) {
    distanceKm = computeDistanceKm(pickup, destination);
  }

  if (!distanceKm || distanceKm <= 0) {
    throw new Error("Invalid distance");
  }

  return Number((rate.baseFare + rate.perKm * distanceKm).toFixed(2));
}

export function getOtp(num) {
  const digits = Number(num);
  const max = 10 ** digits;

  const otp = crypto.randomInt(max);
  return String(otp).padStart(digits, "0");
}

export const createRide = async ({
  user,
  pickup,
  destination,
  vehicleType,
  distance,
  duration
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("Missing required fields");
  }

  const fare = await getFare({
    vehicleType,
    distance,
    pickup,
    destination,
  });

  const ride = await rideModel.create({
    user,
    pickup,
    destination,
    fare,
    distance,
    duration,
    otp: getOtp(6),
  });

  return ride;
};