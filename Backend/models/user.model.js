import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../utils/config.js";

const userSchema = new mongoose.Schema(
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
      minlength: [5, "Email must be atleast 5 characters long"],
    },
    password: { type: String, required: true, select: false },
    socketId: { type: String },
    wallet: {
      balance: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, role: "user" }, JWT_SECRET, {
    expiresIn: "24h",
  });
};

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const userModel = mongoose.model("User", userSchema);
export default userModel;
