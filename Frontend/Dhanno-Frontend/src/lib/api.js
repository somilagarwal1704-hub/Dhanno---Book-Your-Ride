import axios from "axios";

export const API_BASE = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 15000,
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
