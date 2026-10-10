import "dotenv/config";

// FRONTEND_URL may list several origins separated by commas, e.g.
// "https://dhanno.vercel.app,http://localhost:5173". Trailing slashes are ignored.
export const CLIENT_ORIGINS = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);
export const IS_PROD = process.env.NODE_ENV === "production";
export const JWT_SECRET = process.env.JWT_SECRET;