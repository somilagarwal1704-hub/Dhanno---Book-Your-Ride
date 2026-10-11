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

const OSRM_SERVERS = [
  "https://router.project-osrm.org",
  "https://routing.openstreetmap.de/routed-car",
];

const straightKm = (a, b) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

/**
 * Road route between two [lat, lng] points. Tries two public OSRM servers.
 * If both are unreachable, returns a straight line with an estimated road
 * distance (about 1.3x the straight-line distance) so the map still shows a path.
 */
export const fetchRoute = async (from, to) => {
  for (const base of OSRM_SERVERS) {
    try {
      const url = `${base}/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.code === "Ok" && data.routes?.length) {
        const r = data.routes[0];
        return {
          coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
          distanceKm: r.distance / 1000,
          durationMin: Math.max(1, Math.ceil(r.duration / 60)),
          approximate: false,
        };
      }
    } catch {
      // try the next server
    }
  }
  const estKm = straightKm(from, to) * 1.3;
  return {
    coords: [from, to],
    distanceKm: estKm,
    durationMin: Math.max(1, Math.ceil((estKm / 25) * 60)),
    approximate: true,
  };
};

export const directionsUrl = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;