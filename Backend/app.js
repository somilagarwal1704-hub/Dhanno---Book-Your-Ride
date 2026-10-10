import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToDb from "./db/db.js";
import userRouter from "./routes/user.routes.js";
import captainRouter from "./routes/captain.routes.js";
import rideRouter from "./routes/ride.routes.js";
import transactionRouter from "./routes/transaction.routes.js";
import mapsRoutes from "./routes/maps.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { CLIENT_ORIGINS } from "./utils/config.js";

const app = express();

// Behind Render/Railway/Fly proxies, trust the first hop so rate limits see the real client IP.
app.set("trust proxy", 1);

connectToDb();

// Credentialed CORS must name an explicit origin; a wildcard blocks cookies.
app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header (curl, server-to-server) are allowed.
      if (!origin || CLIENT_ORIGINS.includes(origin.replace(/\/+$/, ""))) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => res.json({ service: "dhanno", status: "ok" }));

app.use("/users", userRouter);
app.use("/captains", captainRouter);
app.use("/rides", rideRouter);
app.use("/transactions", transactionRouter);
app.use("/maps", mapsRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

export default app;