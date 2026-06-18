import mongoose, { Document, ObjectId } from "mongoose";

export interface IWithdrawRequest extends Document {
  user: ObjectId;
  username: string;
  amount: number;
  upiId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

const withdrawRequestSchema = new mongoose.Schema<IWithdrawRequest>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    amount: { type: Number, required: true },
    upiId: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model<IWithdrawRequest>("WithdrawRequest", withdrawRequestSchema);
