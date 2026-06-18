import mongoose, { Document, ObjectId } from "mongoose";

export interface IUserNotification extends Document {
  userId: ObjectId;
  type: "game_win" | "points_credit" | "points_debit" | "join_accepted" | "room_finished" | "system";
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: Date;
}

const userNotificationSchema = new mongoose.Schema<IUserNotification>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["game_win", "points_credit", "points_debit", "join_accepted", "room_finished", "system"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUserNotification>("UserNotification", userNotificationSchema);
