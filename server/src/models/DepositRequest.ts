import mongoose, { Document, ObjectId } from "mongoose";

export interface IDepositRequest extends Document {
  user: ObjectId;
  username: string;
  amount: number;
  utrNumber: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

const depositRequestSchema = new mongoose.Schema<IDepositRequest>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    amount: { type: Number, required: true },
    utrNumber: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model<IDepositRequest>("DepositRequest", depositRequestSchema);
