import { IS_PROD } from "./config.js";

// Separate cookies per role so a rider and a captain can be signed in
// in two tabs of the same browser (handy for testing chat end-to-end).
export const AUTH_COOKIE = {
  user: "user_token",
  captain: "captain_token",
};

export const cookieOptions = () => ({
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
});

export const readCookie = (cookieHeader = "", name) => {
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};
