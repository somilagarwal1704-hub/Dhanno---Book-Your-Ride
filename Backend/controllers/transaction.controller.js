import transactionModel from "../models/transaction.model.js";
import { getWalletSummary, topUpWallet } from "../services/transaction.service.js";

export const listTransactionsController = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 40, 100);
  const filter = { owner: req.actor.id, ownerRole: req.actor.role };
  if (req.query.direction === "credit" || req.query.direction === "debit") {
    filter.direction = req.query.direction;
  }
  const transactions = await transactionModel
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);
  res.status(200).json({ transactions });
};

export const summaryController = async (req, res) => {
  res.status(200).json(await getWalletSummary(req.actor));
};

export const topUpController = async (req, res) => {
  const balance = await topUpWallet(req.actor.id, req.body.amount);
  res.status(201).json({ balance });
};
