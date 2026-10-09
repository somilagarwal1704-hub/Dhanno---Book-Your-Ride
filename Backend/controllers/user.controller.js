import userModel from "../models/user.model.js";
import { createUser } from "../services/user.service.js";
import { validationResult } from "express-validator";
import BlacklistedToken from "../models/blacklistToken.model.js";
import { AUTH_COOKIE, cookieOptions } from "../utils/cookies.js";
import { HttpError } from "../middlewares/error.middleware.js";
import { tokenFor } from "../middlewares/auth.middleware.js";

const validationFailed = (req) => {
  const errors = validationResult(req);
  return errors.isEmpty() ? null : errors.array();
};

export const registerUser = async (req, res) => {
  const errors = validationFailed(req);
  if (errors) return res.status(400).json({ errors });

  const { fullname, email, password } = req.body;
  const normalized = email.toLowerCase().trim();

  if (await userModel.exists({ email: normalized })) {
    throw new HttpError(400, "User with this email already exists");
  }

  const user = await createUser({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email: normalized,
    password: await userModel.hashPassword(password),
  });

  const token = user.generateAuthToken();
  res
    .cookie(AUTH_COOKIE.user, token, cookieOptions())
    .status(201)
    .json({ message: "User Created successfully", token, user });
};

export const loginUser = async (req, res) => {
  const errors = validationFailed(req);
  if (errors) return res.status(400).json({ errors });

  const { email, password } = req.body;
  const user = await userModel
    .findOne({ email: email.toLowerCase().trim() })
    .select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new HttpError(400, "Invalid email or password");
  }

  const token = user.generateAuthToken();
  res
    .cookie(AUTH_COOKIE.user, token, cookieOptions())
    .status(200)
    .json({ message: "Login successful", token, user });
};

export const getUserProfile = async (req, res) => {
  res.status(200).json({ user: req.user });
};

export const logoutUser = async (req, res) => {
  const token = tokenFor(req, "user");
  if (token) {
    await BlacklistedToken.updateOne({ token }, { $set: { token } }, { upsert: true });
  }
  res.clearCookie(AUTH_COOKIE.user, cookieOptions());
  res.status(200).json({ message: "Logout successful" });
};
