import express from "express";
import { body } from "express-validator";
import { createRideController } from "../controllers/ride.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const rideRouter = express.Router();

rideRouter.post('/create', authUser, [
  body('pickup').notEmpty().withMessage('Pickup location is required'),
  body('destination').notEmpty().withMessage('Destination location is required'),
  body('vehicleType').isIn(['car', 'bike', 'auto']).withMessage('Vehicle type must be either car, bike, or auto')
], createRideController);
export default rideRouter;