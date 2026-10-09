import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import captainModel from "../models/captain.model.js";
import BlacklistedToken from "../models/blacklistToken.model.js";
import { AUTH_COOKIE } from "../utils/cookies.js";
import { JWT_SECRET } from "../utils/config.js";

const bearer = (req) => req.headers.authorization?.split(" ")[1];

const isBlacklisted = (token) => BlacklistedToken.exists({ token });

/**
 * Resolve the token for a role. Cookie first (browser sessions), then a
 * Bearer header (API clients / tooling).
 */
const tokenFor = (req, role) => req.cookies?.[AUTH_COOKIE[role]] || bearer(req);

const loadAccount = async (role, id) =>
  role === "captain" ? captainModel.findById(id) : userModel.findById(id);

/**
 * Verify a token and load the matching account. Returns { role, doc } or null.
 * `roles` lists which account types are acceptable for this check.
 */
const authenticate = async (token, roles) => {
  if (!token) return { error: 401, message: "Access Denied. No token provided." };
  if (await isBlacklisted(token)) {
    return { error: 401, message: "Invalid token. Please login again." };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return { error: 401, message: "Invalid or expired token. Please login again." };
  }

  // Tokens issued before roles were embedded have no `role`; try each allowed role.
  const candidates = decoded.role ? [decoded.role] : roles;
  for (const role of candidates) {
    if (!roles.includes(role)) continue;
    const doc = await loadAccount(role, decoded._id);
    if (doc) return { role, doc };
  }
  return { error: 401, message: "Access Denied. Account not found." };
};

const guard = (roles) => async (req, res, next) => {
  try {
    // Pick the cookie of the first acceptable role that is present.
    const token =
      roles.map((r) => req.cookies?.[AUTH_COOKIE[r]]).find(Boolean) ||
      bearer(req);

    const result = await authenticate(token, roles);
    if (result.error) {
      return res.status(result.error).json({ message: result.message });
    }

    req.actor = { role: result.role, id: result.doc._id.toString(), doc: result.doc };
    if (result.role === "user") req.user = result.doc;
    if (result.role === "captain") req.captain = result.doc;
    return next();
  } catch (err) {
    return next(err);
  }
};

export const authUser = guard(["user"]);
export const authCaptain = guard(["captain"]);
/** Either a rider or a captain (used for shared ride endpoints). */
export const authAny = guard(["user", "captain"]);

export { tokenFor, isBlacklisted };
