import axios from "axios";
import { getToken } from "./session.js";

export const API_BASE = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 60000, // the Render free server can take about 50 seconds to wake up
});

// Pick the right session token for each request: captain routes use the captain token,
// rider routes use the rider token.
const roleFor = (url = "") => {
  if (url.startsWith("/captains/nearby")) return "user";
  if (url.startsWith("/captains")) return "captain";
  if (url.startsWith("/users")) return "user";
  return window.location.pathname.startsWith("/captain") ? "captain" : "user";
};

api.interceptors.request.use((config) => {
  const token = getToken(roleFor(config.url));
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Turn any API/network failure into a sentence a person can act on. */
export const errorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (err?.code === "ERR_NETWORK" || err?.message === "Network Error") {
    return "Can't reach the Dhanno server. Check your connection or try again shortly.";
  }
  const data = err?.response?.data;
  return data?.message || data?.errors?.[0]?.msg || fallback;
};

export const errorCode = (err) => err?.response?.data?.code;