import { createRide } from "../services/ride.service.js";

import { validationResult } from "express-validator";

export const createRideController = async (req, res) => {
     try{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {pickup, destination, vehicleType, distance, duration } = req.body;

    const ride = await createRide({ user:req.user._id , pickup, destination, vehicleType, distance, duration });
    return res.status(201).json(ride);
  } catch (error) {
    return res.status(400).json({ error: error.message ,});
  }
};
