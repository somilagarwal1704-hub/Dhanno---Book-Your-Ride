import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    ride: { type: mongoose.Schema.Types.ObjectId, ref: "ride", required: true },
    senderRole: { type: String, enum: ["user", "captain"], required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true },
);

messageSchema.index({ ride: 1, createdAt: 1 });

const messageModel = mongoose.model("Message", messageSchema);
export default messageModel;
