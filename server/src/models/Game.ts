import mongoose, { Document, ObjectId } from "mongoose";

export interface IGame extends Document {
  room: ObjectId;
  player1: ObjectId;
  player2: ObjectId | null;
  status: string;
  screenshot1: string;
  screenshot2: string;
  message1: string;
  message2: string;
  winner: ObjectId | null;
  reviewedBy: ObjectId | null;
  reviewedAt: Date | null;
  pointsAwarded: number;
}

const gameSchema = new mongoose.Schema<IGame>(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    player1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["pending", "screenshot_uploaded", "review", "completed", "cancelled"],
      default: "pending",
    },
    screenshot1: { type: String, default: "" },
    screenshot2: { type: String, default: "" },
    message1: { type: String, default: "" },
    message2: { type: String, default: "" },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    pointsAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IGame>("Game", gameSchema);
