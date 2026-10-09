import { getLocationSuggestions, reverseGeocode } from "../services/maps.service.js";
import { HttpError } from "../middlewares/error.middleware.js";

export const getSuggestions = async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const near = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  const suggestions = await getLocationSuggestions(req.query.input, near);
  res.status(200).json(suggestions);
};

export const reverseController = async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new HttpError(400, "lat and lng are required");
  }
  res.status(200).json(await reverseGeocode(lat, lng));
};
