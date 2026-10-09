import "dotenv/config";

export const CLIENT_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";
export const IS_PROD = process.env.NODE_ENV === "production";
export const JWT_SECRET = process.env.JWT_SECRET;
