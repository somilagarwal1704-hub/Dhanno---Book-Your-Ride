import { round2 } from "./math.js";

export const inr = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** "Today", "Yesterday", or a short date, for grouping lists. */
export const dayLabel = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(d, today)) return "Today";
  if (same(d, yesterday)) return "Yesterday";
  return formatDate(d);
};

export const STATUS_META = {
  pending: { label: "Finding a captain", tone: "warn" },
  accepted: { label: "Captain on the way", tone: "info" },
  in_progress: { label: "On trip", tone: "success" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export const VEHICLE_META = {
  car: { label: "Cab", seats: 4, image: "car" },
  bike: { label: "Bike", seats: 1, icon: "ri-motorbike-fill" },
  auto: { label: "Auto", seats: 3, image: "auto" },
};

export const formatDistance = (km) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${round2(km).toFixed(1)} km`;

/** Road route between two [lat, lng] points via the OSRM demo server. */
export const fetchRoute = async (from, to) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.code !== "Ok" || !data.routes?.length) throw new Error("No route found");
  const r = data.routes[0];
  return {
    coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceKm: r.distance / 1000,
    durationMin: Math.max(1, Math.ceil(r.duration / 60)),
  };
};

export const directionsUrl = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
