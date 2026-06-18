import mongoose, { Document } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  type: "tournament" | "system" | "update";
  targetUsers: string[];
  createdAt: Date;
  expiresAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["tournament", "system", "update"],
      default: "system",
    },
    targetUsers: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>("Notification", notificationSchema);
