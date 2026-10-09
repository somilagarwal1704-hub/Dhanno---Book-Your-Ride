import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, required: true },
    ownerRole: { type: String, enum: ["user", "captain"], required: true },
    type: {
      type: String,
      enum: ["topup", "ride_payment", "cash_ride", "ride_earning"],
      required: true,
    },
    direction: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number },
    method: { type: String, enum: ["wallet", "cash", "gateway"], required: true },
    ride: { type: mongoose.Schema.Types.ObjectId, ref: "ride" },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

transactionSchema.index({ owner: 1, ownerRole: 1, createdAt: -1 });

const transactionModel = mongoose.model("Transaction", transactionSchema);
export default transactionModel;
