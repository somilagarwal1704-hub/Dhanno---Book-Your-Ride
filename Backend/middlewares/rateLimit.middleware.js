import rateLimit from "express-rate-limit";

const build = (windowMs, max, message, extra = {}) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
    ...extra,
  });

export const authRateLimiter = build(
  15 * 60 * 1000,
  20,
  "Too many authentication attempts from this IP, please try again later.",
  { skipSuccessfulRequests: true },
);

export const rideCreateRateLimiter = build(
  60 * 1000,
  5,
  "Too many ride creation attempts, please wait a moment before trying again.",
);

export const otpRateLimiter = build(
  60 * 1000,
  8,
  "Too many OTP attempts, please wait a moment before trying again.",
);

export const topUpRateLimiter = build(
  60 * 1000,
  10,
  "Too many wallet requests, please slow down.",
);
