import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import captainModel from "../models/captain.model.js";
import transactionModel from "../models/transaction.model.js";
import { HttpError } from "../middlewares/error.middleware.js";
import { round2 } from "../utils/geo.js";

export const COMMISSION_RATE = 0.2; // platform keeps 20% of each ride

const shortPlace = (place) => place?.address?.split(",")[0] || "destination";

export const topUpWallet = async (userId, amount) => {
  const value = round2(Number(amount));
  if (!Number.isFinite(value) || value < 10 || value > 20000) {
    throw new HttpError(400, "Top-up must be between ₹10 and ₹20,000");
  }

  const user = await userModel.findByIdAndUpdate(
    userId,
    { $inc: { "wallet.balance": value } },
    { new: true },
  );
  if (!user) throw new HttpError(404, "User not found");

  await transactionModel.create({
    owner: user._id,
    ownerRole: "user",
    type: "topup",
    direction: "credit",
    amount: value,
    balanceAfter: user.wallet.balance,
    method: "gateway",
    description: "Wallet top-up (simulated payment)",
  });
  return user.wallet.balance;
};

/**
 * Settle a completed ride. Wallet rides move money between rider and captain
 * atomically (the debit only succeeds if the rider can afford it). Cash rides
 * are recorded for the books but don't touch either wallet.
 */
export const settleRide = async ({ ride, paymentMethod }) => {
  const fare = round2(ride.fare);
  const captainShare = round2(fare * (1 - COMMISSION_RATE));
  const commission = round2(fare - captainShare);
  const description = `Ride to ${shortPlace(ride.destination)}`;

  if (paymentMethod === "wallet") {
    const rider = await userModel.findOneAndUpdate(
      { _id: ride.user, "wallet.balance": { $gte: fare } },
      { $inc: { "wallet.balance": -fare } },
      { new: true },
    );
    if (!rider) {
      throw new HttpError(
        402,
        "Rider's wallet balance is too low. Ask them to pay by cash instead.",
        { code: "WALLET_INSUFFICIENT" },
      );
    }

    const captain = await captainModel.findByIdAndUpdate(
      ride.captain,
      { $inc: { "wallet.balance": captainShare } },
      { new: true },
    );

    await transactionModel.insertMany([
      {
        owner: rider._id,
        ownerRole: "user",
        type: "ride_payment",
        direction: "debit",
        amount: fare,
        balanceAfter: rider.wallet.balance,
        method: "wallet",
        ride: ride._id,
        description,
      },
      {
        owner: ride.captain,
        ownerRole: "captain",
        type: "ride_earning",
        direction: "credit",
        amount: captainShare,
        balanceAfter: captain?.wallet?.balance,
        method: "wallet",
        ride: ride._id,
        description: `${description} · after ₹${commission} platform fee`,
      },
    ]);
  } else {
    await transactionModel.insertMany([
      {
        owner: ride.user,
        ownerRole: "user",
        type: "cash_ride",
        direction: "debit",
        amount: fare,
        method: "cash",
        ride: ride._id,
        description: `${description} · paid in cash`,
      },
      {
        owner: ride.captain,
        ownerRole: "captain",
        type: "ride_earning",
        direction: "credit",
        amount: captainShare,
        method: "cash",
        ride: ride._id,
        description: `${description} · cash collected`,
      },
    ]);
  }

  return { fare, captainShare, commission, paymentMethod };
};

export const getWalletSummary = async (actor) => {
  const ownerId = new mongoose.Types.ObjectId(actor.id);
  const startOfToday = (() => {
    // Midnight in India Standard Time (UTC+5:30), the app's operating timezone.
    const IST = 5.5 * 60 * 60 * 1000;
    const now = Date.now();
    return new Date(Math.floor((now + IST) / 86400000) * 86400000 - IST);
  })();

  const totals = await transactionModel.aggregate([
    { $match: { owner: ownerId, ownerRole: actor.role } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const today = await transactionModel.aggregate([
    {
      $match: {
        owner: ownerId,
        ownerRole: actor.role,
        createdAt: { $gte: startOfToday },
      },
    },
    { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);

  const pick = (rows, type) => rows.find((r) => r._id === type) || { total: 0, count: 0 };

  if (actor.role === "captain") {
    const earnings = pick(totals, "ride_earning");
    const todayEarnings = pick(today, "ride_earning");
    return {
      balance: round2(actor.doc.wallet?.balance ?? 0),
      totalEarnings: round2(earnings.total),
      ridesCompleted: earnings.count,
      todayEarnings: round2(todayEarnings.total),
      todayRides: todayEarnings.count,
      rating: actor.doc.rating ?? { average: 0, count: 0 },
    };
  }

  const payments = pick(totals, "ride_payment");
  const cashRides = pick(totals, "cash_ride");
  return {
    balance: round2(actor.doc.wallet?.balance ?? 0),
    totalSpent: round2(payments.total + cashRides.total),
    totalToppedUp: round2(pick(totals, "topup").total),
    ridesPaid: payments.count + cashRides.count,
  };
};
