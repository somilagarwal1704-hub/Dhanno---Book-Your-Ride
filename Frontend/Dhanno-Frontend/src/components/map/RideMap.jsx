import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "../../context/ThemeContext.jsx";

// OpenStreetMap tiles need no API key. Dark mode is a CSS filter on the same tiles
// (see .dh-map-dark in index.css), so no keyed provider is required.
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const CAR_ICON = { car: "ri-car-fill", auto: "ri-taxi-fill", bike: "ri-motorbike-fill" };

const makeIcons = () => ({
  pickup: L.divIcon({ className: "", html: '<div class="dh-dot"></div>', iconSize: [26, 26], iconAnchor: [13, 13] }),
  destination: L.divIcon({ className: "", html: '<div class="dh-pin"><i class="ri-map-pin-fill"></i></div>', iconSize: [34, 34], iconAnchor: [17, 32] }),
  user: L.divIcon({ className: "", html: '<div class="dh-user"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
  car: (type) =>
    L.divIcon({
      className: "dh-car-marker",
      html: `<div class="dh-car"><i class="${CAR_ICON[type] || CAR_ICON.car}"></i></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    }),
  nearby: (type) =>
    L.divIcon({
      className: "",
      html: `<div class="dh-nearby"><i class="${CAR_ICON[type] || CAR_ICON.car}"></i></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    }),
});

/** Keeps every relevant point in view, animating when the set of points changes. */
const FitView = ({ points, signal }) => {
  const map = useMap();
  const key = JSON.stringify(points) + signal;

  useEffect(() => {
    const valid = points.filter(Boolean);
    if (!valid.length) return;
    if (valid.length === 1) {
      map.flyTo(valid[0], 15, { duration: 0.9 });
      return;
    }
    map.fitBounds(L.latLngBounds(valid), {
      padding: [70, 70],
      maxZoom: 16,
      animate: true,
      duration: 0.8,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
};

const Resizer = () => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map]);
  return null;
};

/**
 * Props
 *  pickup / destination / userPos / captain: [lat, lng] or { lat, lng, vehicleType }
 *  route: array of [lat, lng] drawn as an animated line
 *  nearby: [{ id, lat, lng, vehicleType }] shown as small markers
 *  fitSignal: change to re-fit the view (e.g. the "recenter" button)
 */
const RideMap = ({
  pickup = null,
  destination = null,
  userPos = null,
  captain = null,
  route = [],
  nearby = [],
  fitSignal = 0,
  className = "",
  defaultCenter = [28.6139, 77.209],
}) => {
  const { isDark } = useTheme();
  const icons = useMemo(() => makeIcons(), []);
  const captainPos = captain ? [captain.lat, captain.lng] : null;
  const fitPoints = [pickup, destination, captainPos, userPos].filter(Boolean);

  return (
    <div className={`relative isolate h-full w-full ${isDark ? "dh-map-dark" : ""} ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
        attributionControl
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={19} />
        <Resizer />
        <FitView points={fitPoints} signal={fitSignal} />

        {route.length > 1 && (
          <>
            <Polyline positions={route} pathOptions={{ color: "#f5b301", weight: 10, opacity: 0.25, className: "dh-route-glow" }} />
            <Polyline positions={route} pathOptions={{ color: "#f5b301", weight: 4, className: "dh-route" }} />
          </>
        )}

        {nearby.map((c) => (
          <Marker key={c.id} position={[c.lat, c.lng]} icon={icons.nearby(c.vehicleType)} interactive={false} />
        ))}

        {userPos && <Marker position={userPos} icon={icons.user} interactive={false} />}
        {pickup && <Marker position={pickup} icon={icons.pickup} />}
        {destination && <Marker position={destination} icon={icons.destination} />}
        {captainPos && <Marker position={captainPos} icon={icons.car(captain.vehicleType)} />}
      </MapContainer>
    </div>
  );
};

/** Floating control to re-fit the map to the current points. */
export const RecenterButton = ({ onClick, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Fit map to route"
    className={`grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-ink shadow-card transition active:scale-95 ${className}`}
  >
    <i className="ri-focus-3-line text-lg" />
  </button>
);

export default RideMap;
