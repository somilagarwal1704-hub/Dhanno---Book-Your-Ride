import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { _id: false },
);

const rideSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    captain: { type: mongoose.Schema.Types.ObjectId, ref: "Captain" },
    pickup: { type: placeSchema, required: true },
    destination: { type: placeSchema, required: true },
    vehicleType: {
      type: String,
      enum: ["car", "bike", "auto"],
      required: true,
    },
    fare: { type: Number, required: true },
    finalFare: { type: Number },
    distance: { type: Number },
    duration: { type: Number },

    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    paymentMethod: { type: String, enum: ["cash", "wallet"], default: "cash" },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },

    // Dispatch state: the captain currently holding the offer, and captains who passed.
    currentOffer: {
      captain: { type: mongoose.Schema.Types.ObjectId, ref: "Captain" },
      expiresAt: Date,
      offeredAt: Date,
    },
    rejectedCaptains: [{ type: mongoose.Schema.Types.ObjectId, ref: "Captain" }],
    matchAttempts: { type: Number, default: 0 },
    noCaptainFound: { type: Boolean, default: false },

    cancelledBy: { type: String, enum: ["user", "captain", "system"] },
    cancelReason: { type: String },

    requestedAt: { type: Date, default: Date.now },
    acceptedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,

    rating: {
      stars: { type: Number, min: 1, max: 5 },
      comment: { type: String, maxlength: 300 },
      ratedAt: Date,
    },

    otp: { type: String, select: false, required: true },
    otpVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

rideSchema.index({ user: 1, createdAt: -1 });
rideSchema.index({ captain: 1, status: 1 });
rideSchema.index({ status: 1, createdAt: 1 });

const rideModel = mongoose.model("ride", rideSchema);
export default rideModel;
