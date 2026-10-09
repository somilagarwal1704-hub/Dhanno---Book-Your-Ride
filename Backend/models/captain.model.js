import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../utils/config.js";

const captainSchema = new mongoose.Schema(
  {
    fullname: {
      firstname: {
        type: String,
        required: true,
        minlength: [3, "First name must be atleast 3 characters long"],
      },
      lastname: {
        type: String,
        minlength: [3, "Last name must be atleast 3 characters long"],
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    password: { type: String, required: true, select: false },
    socketId: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    vehicle: {
      color: {
        type: String,
        required: true,
        minlength: [3, "Color must be atleast 3 characters long"],
      },
      plate: {
        type: String,
        required: true,
        minlength: [3, "Plate number must be atleast 3 characters long"],
      },
      capacity: {
        type: Number,
        required: true,
        min: [1, "Capacity must be atleast 1"],
      },
      vehicleType: {
        type: String,
        required: true,
        enum: ["car", "bike", "auto"],
      },
    },
    location: {
      lat: { type: Number },
      long: { type: Number },
      updatedAt: { type: Date },
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    wallet: {
      balance: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

captainSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

captainSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, role: "captain" }, JWT_SECRET, {
    expiresIn: "24h",
  });
};

captainSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

captainSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 10);
};

const captainModel = mongoose.model("Captain", captainSchema);
export default captainModel;
