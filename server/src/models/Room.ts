import mongoose, { Document, ObjectId } from "mongoose";

export interface IRoom extends Document {
  name: string;
  fee: number;
  type: string;
  size: string;
  headshot: string;
  rounds: string;
  coin: string;
  throwable: string;
  charAbility: string;
  character: string;
  gun: string;
  unallowedGuns: string[];
  unallowedChars: string[];
  unallowedArmor: string;
  creator: ObjectId;
  creatorName: string;
  status: string;
  joinedBy: ObjectId | null;
  joinedByName: string;
  joinStatus: string;
  roomIdPass: string;
  roomPass: string;
  winner: ObjectId | null;
}

const roomSchema = new mongoose.Schema<IRoom>(
  {
    name: { type: String, required: true },
    fee: { type: Number, required: true },
    type: { type: String, enum: ["lonewolf", "team"], default: "lonewolf" },
    size: { type: String, enum: ["1v1", "2v2", "3v3", "4v4"], default: "1v1" },
    headshot: { type: String, enum: ["yes", "no"], default: "yes" },
    rounds: { type: String, enum: ["7", "13"], default: "7" },
    coin: { type: String, default: "Default" },
    throwable: { type: String, enum: ["yes", "no"], default: "yes" },
    charAbility: { type: String, enum: ["yes", "no"], default: "yes" },
    character: { type: String, default: "" },
    gun: { type: String, default: "" },
    unallowedGuns: [{ type: String }],
    unallowedChars: [{ type: String }],
    unallowedArmor: { type: String, default: "Vest Lv3, Helmet Lv3" },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    creatorName: { type: String, required: true },
    status: { type: String, enum: ["active", "finished", "cancelled"], default: "active" },
    joinedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    joinedByName: { type: String, default: "" },
    joinStatus: { type: String, enum: ["none", "pending", "accepted", "rejected"], default: "none" },
    roomIdPass: { type: String, default: "" },
    roomPass: { type: String, default: "" },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IRoom>("Room", roomSchema);
