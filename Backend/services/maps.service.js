import axios from "axios";
import { HttpError } from "../middlewares/error.middleware.js";
 
const HEADERS = { "User-Agent": "DhannoRideApp/2.0 (contact: support@dhanno.app)" };
const NOMINATIM = "https://nominatim.openstreetmap.org";
const PHOTON = "https://photon.komoot.io/api";
const COUNTRY_CODE = (process.env.SEARCH_COUNTRY_CODE || "IN").toUpperCase();
 
/** Build a readable "Moradabad, Uttar Pradesh, India" style label from Photon properties. */
const photonLabel = (p) =>
  [...new Set([p.name, p.district, p.city, p.county, p.state, p.country].filter(Boolean))].join(", ");
 
/**
 * Typeahead search. Photon is built for autocomplete: "morada" matches
 * "Moradabad" as you type, and results are ranked by distance to the rider.
 */
const searchPhoton = async (input, near) => {
  const params = { q: input, limit: 10, lang: "en" };
  if (near) {
    params.lat = near.lat;
    params.lon = near.lng;
  }
  const { data } = await axios.get(PHOTON, { params, headers: HEADERS, timeout: 6000 });
  return data.features
    .filter((f) => (f.properties?.countrycode || "").toUpperCase() === COUNTRY_CODE)
    .slice(0, 6)
    .map((f) => ({
      displayName: photonLabel(f.properties),
      latitude: String(f.geometry.coordinates[1]),
      longitude: String(f.geometry.coordinates[0]),
    }))
    .filter((p) => p.displayName);
};
 
/** Fallback: Nominatim (exact-match geocoder), restricted to the country. */
const searchNominatim = async (input, near) => {
  const params = {
    q: input,
    format: "json",
    addressdetails: 1,
    limit: 10,
    dedupe: 1,
    countrycodes: COUNTRY_CODE.toLowerCase(),
    "accept-language": "en",
  };
  if (near) {
    const d = 0.6;
    params.viewbox = [near.lng - d, near.lat + d, near.lng + d, near.lat - d].join(",");
    params.bounded = 0;
  }
  const { data } = await axios.get(`${NOMINATIM}/search`, { params, headers: HEADERS, timeout: 8000 });
  return data
    .filter((place) => {
      const code = place.address?.country_code;
      return !code || code.toUpperCase() === COUNTRY_CODE;
    })
    .slice(0, 6)
    .map((place) => ({
      displayName: place.display_name,
      latitude: place.lat,
      longitude: place.lon,
    }));
};
 
export const getLocationSuggestions = async (input, near) => {
  if (!input || String(input).trim().length < 2) {
    throw new HttpError(400, "Location input is required");
  }
  const query = String(input).trim();
  const bias = near && Number.isFinite(near.lat) && Number.isFinite(near.lng) ? near : null;
 
  try {
    const results = await searchPhoton(query, bias);
    if (results.length) return results;
  } catch {
    // Photon unavailable or rate-limited: fall through to Nominatim.
  }
 
  try {
    return await searchNominatim(query, bias);
  } catch {
    throw new HttpError(502, "Unable to fetch location suggestions");
  }
};
 
export const reverseGeocode = async (lat, lng) => {
  try {
    const { data } = await axios.get(`${NOMINATIM}/reverse`, {
      params: { lat, lon: lng, format: "json", zoom: 18 },
      headers: HEADERS,
      timeout: 8000,
    });
    return { displayName: data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}` };
  } catch {
    return { displayName: `${lat.toFixed(5)}, ${lng.toFixed(5)}` };
  }
};