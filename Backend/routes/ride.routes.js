import express from "express";
import { body, param } from "express-validator";
import {
  createRideController,
  estimateController,
  activeRideController,
  historyController,
  getRideController,
  messagesController,
  acceptController,
  declineController,
  startController,
  completeController,
  cancelController,
  rateController,
  retryController,
} from "../controllers/ride.controller.js";
import { authUser, authCaptain, authAny } from "../middlewares/auth.middleware.js";
import {
  rideCreateRateLimiter,
  otpRateLimiter,
} from "../middlewares/rateLimit.middleware.js";

const rideRouter = express.Router();
const rideId = param("rideId").isMongoId().withMessage("Invalid ride id");

rideRouter.post(
  "/create",
  rideCreateRateLimiter,
  authUser,
  [
    body("pickup.address").notEmpty().withMessage("Pickup address is required"),
    body("pickup.location.lat").isFloat({ min: -90, max: 90 }).withMessage("Pickup latitude is required"),
    body("pickup.location.lng").isFloat({ min: -180, max: 180 }).withMessage("Pickup longitude is required"),
    body("destination.address").notEmpty().withMessage("Destination address is required"),
    body("destination.location.lat").isFloat({ min: -90, max: 90 }).withMessage("Destination latitude is required"),
    body("destination.location.lng").isFloat({ min: -180, max: 180 }).withMessage("Destination longitude is required"),
    body("vehicleType").isIn(["car", "bike", "auto"]).withMessage("Vehicle type must be either car, bike, or auto"),
    body("distance").notEmpty().withMessage("Distance is required"),
    body("duration").notEmpty().withMessage("Duration is required"),
    body("paymentMethod").optional().isIn(["cash", "wallet"]).withMessage("Payment must be cash or wallet"),
  ],
  createRideController,
);

// Static paths first so they aren't captured by /:rideId.
rideRouter.get("/estimate", authUser, estimateController);
rideRouter.get("/active", authAny, activeRideController);
rideRouter.get("/history", authAny, historyController);

rideRouter.get("/:rideId", authAny, [rideId], getRideController);
rideRouter.get("/:rideId/messages", authAny, [rideId], messagesController);

rideRouter.post("/:rideId/accept", authCaptain, [rideId], acceptController);
rideRouter.post("/:rideId/decline", authCaptain, [rideId], declineController);
rideRouter.post(
  "/:rideId/start",
  otpRateLimiter,
  authCaptain,
  [rideId, body("otp").isLength({ min: 4, max: 4 }).withMessage("Enter the 4-digit OTP")],
  startController,
);
rideRouter.post(
  "/:rideId/complete",
  authCaptain,
  [rideId, body("switchToCash").optional().isBoolean()],
  completeController,
);
rideRouter.post("/:rideId/cancel", authAny, [rideId], cancelController);
rideRouter.post(
  "/:rideId/rate",
  authUser,
  [rideId, body("stars").isInt({ min: 1, max: 5 }).withMessage("Choose 1 to 5 stars")],
  rateController,
);
rideRouter.post("/:rideId/retry", authUser, [rideId], retryController);

export default rideRouter;
