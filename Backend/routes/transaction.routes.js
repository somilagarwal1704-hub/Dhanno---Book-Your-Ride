import express from "express";
import { body } from "express-validator";
import {
  listTransactionsController,
  summaryController,
  topUpController,
} from "../controllers/transaction.controller.js";
import { authAny, authUser } from "../middlewares/auth.middleware.js";
import { topUpRateLimiter } from "../middlewares/rateLimit.middleware.js";

const transactionRouter = express.Router();

transactionRouter.get("/", authAny, listTransactionsController);
transactionRouter.get("/summary", authAny, summaryController);
transactionRouter.post(
  "/topup",
  topUpRateLimiter,
  authUser,
  [body("amount").isFloat({ min: 10, max: 20000 }).withMessage("Top-up must be between ₹10 and ₹20,000")],
  topUpController,
);

export default transactionRouter;
