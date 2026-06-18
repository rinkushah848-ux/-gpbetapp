import { Router, Response } from "express";

import Room from "../models/Room";
import User from "../models/User";
import Transaction from "../models/Transaction";
import UserNotification from "../models/UserNotification";
import { sendPushToUser } from "./push";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

// GET /api/rooms
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rooms = await Room.find({ status: "active" })
      .populate("creator", "username uid points")
      .populate("joinedBy", "username uid points")
      .sort({ createdAt: -1 });
    res.json({ rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/rooms/mine
router.get("/mine", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findOne({
      $or: [{ creator: req.user?.id }, { joinedBy: req.user?.id }],
      status: { $nin: ["finished", "cancelled"] },
    })
      .populate("creator", "username uid points")
      .populate("joinedBy", "username uid points");
    res.json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/rooms
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name, fee, type, size, headshot, rounds, coin, throwable,
      charAbility, character, gun, unallowedGuns, unallowedChars, unallowedArmor,
      roomId, roomPass,
    } = req.body;

    if (!name || fee === undefined || fee === null) {
      res.status(400).json({ error: "Name and fee are required" });
      return;
    }

    // Allow any fee between 10 and 1000 (creator input)
    const parsedFee = Number(fee);
    if (!Number.isFinite(parsedFee) || parsedFee < 10 || parsedFee > 1000) {
      res.status(400).json({ error: "Fee must be between 10 and 1000" });
      return;
    }

    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.points < parsedFee) {
      res.status(400).json({ error: "Insufficient points" });
      return;
    }


    const existing = await Room.findOne({
      $or: [{ creator: req.user?.id }, { joinedBy: req.user?.id }],
      status: "active",
    });
    if (existing) {
      res.status(400).json({ error: "You already have an active room or joined a room" });
      return;
    }

    const room = new Room({
      name, fee: parsedFee, type: type || "lonewolf", size: size || "1v1",

      headshot: headshot || "yes", rounds: rounds || "7", coin: coin || "Default",
      throwable: throwable || "yes",
      charAbility: charAbility || "yes", character: character || "",
      gun: gun || "", unallowedGuns: unallowedGuns || [],
      unallowedChars: unallowedChars || [], unallowedArmor: unallowedArmor || "Vest Lv3, Helmet Lv3",
      roomIdPass: roomId || "", roomPass: roomPass || "",
      creator: req.user?.id, creatorName: user.username,
      joinedBy: null, joinStatus: "none",
    });

    await room.save();

    user.points -= parsedFee;

    await user.save();

    await Transaction.create({
      user: user._id,
      type: "room_create",
      amount: fee,
      balanceBefore: user.points + fee,
      balanceAfter: user.points,
      room: room._id,
      description: `Room creation fee for "${name}"`,
    });

    const populated = await Room.findById(room._id)
      .populate("creator", "username uid points")
      .populate("joinedBy", "username uid points");

    res.status(201).json({ room: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/rooms/:id/join
router.post("/:id/join", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if (room.status !== "active") {
      res.status(400).json({ error: "Room is not active" });
      return;
    }
    if (room.joinStatus !== "none") {
      res.status(400).json({ error: "Room already has a pending/accepted player" });
      return;
    }


    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (String(room.creator) === String(user._id)) {
      res.status(400).json({ error: "You cannot join your own room" });
      return;
    }
    if (user.points < room.fee) {
      res.status(400).json({ error: "Insufficient points" });
      return;
    }

    user.points -= room.fee;
    await user.save();

    await Transaction.create({
      user: user._id,
      type: "room_join",
      amount: room.fee,
      balanceBefore: user.points + room.fee,
      balanceAfter: user.points,
      room: room._id,
      description: `Room join fee for "${room.name}"`,
    });

    room.joinedBy = user._id;
    room.joinedByName = user.username;
    room.joinStatus = "pending";
    await room.save();

    const populated = await Room.findById(room._id)
      .populate("creator", "username uid points")
      .populate("joinedBy", "username uid points");

    res.json({ room: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/rooms/:id/accept
router.post("/:id/accept", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if (String(room.creator) !== String(req.user?.id)) {
      res.status(403).json({ error: "Only creator can accept" });
      return;
    }
    if (room.joinStatus !== "pending") {
      res.status(400).json({ error: "No pending join request" });
      return;
    }

    room.joinStatus = "accepted";
    await room.save();

    if (room.joinedBy) {
      await UserNotification.create({
        userId: room.joinedBy,
        type: "join_accepted",
        title: "✅ Join Accepted",
        message: `Your request to join "${room.name}" has been accepted by ${room.creatorName}.`,
        relatedId: String(room._id),
      });
      await sendPushToUser(String(room.joinedBy), "✅ Join Accepted", `You joined "${room.name}"`, "/freefire");
    }

    const populated = await Room.findById(room._id)
      .populate("creator", "username uid points")
      .populate("joinedBy", "username uid points");

    res.json({ room: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/rooms/:id/reject
router.post("/:id/reject", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if (String(room.creator) !== String(req.user?.id)) {
      res.status(403).json({ error: "Only creator can reject" });
      return;
    }
    if (room.joinStatus !== "pending") {
      res.status(400).json({ error: "No pending join request" });
      return;
    }

    const joiner = await User.findById(room.joinedBy);
    if (joiner) {
      joiner.points += room.fee;
      await joiner.save();

      await Transaction.create({
        user: joiner._id,
        type: "admin_credit",
        amount: room.fee,
        balanceBefore: joiner.points - room.fee,
        balanceAfter: joiner.points,
        room: room._id,
        description: `Join fee refund for rejected room "${room.name}"`,
      });
    }

    room.joinedBy = null;
    room.joinedByName = "";
    room.joinStatus = "none";
    await room.save();

    const populated = await Room.findById(room._id)
      .populate("creator", "username uid points")
      .populate("joinedBy", "username uid points");

    res.json({ room: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/rooms/:id/cancel-join
router.post("/:id/cancel-join", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if (String(room.joinedBy) !== String(req.user?.id)) {
      res.status(403).json({ error: "Only the joiner can cancel their join" });
      return;
    }
    if (room.joinStatus === "none") {
      res.status(400).json({ error: "No join request to cancel" });
      return;
    }

    const joiner = await User.findById(room.joinedBy);
    if (joiner) {
      joiner.points += room.fee;
      await joiner.save();

      await Transaction.create({
        user: joiner._id,
        type: "admin_credit",
        amount: room.fee,
        balanceBefore: joiner.points - room.fee,
        balanceAfter: joiner.points,
        room: room._id,
        description: `Join fee refund for cancelled join in "${room.name}"`,
      });
    }

    room.joinedBy = null;
    room.joinedByName = "";
    room.joinStatus = "none";
    await room.save();

    const populated = await Room.findById(room._id)
      .populate("creator", "username uid points")
      .populate("joinedBy", "username uid points");

    res.json({ room: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/rooms/:id/give-idpass
router.post("/:id/give-idpass", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomIdPass, roomId, roomPass } = req.body;
    if (!roomIdPass && !roomId) {
      res.status(400).json({ error: "Room ID is required" });
      return;
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if (String(room.creator) !== String(req.user?.id) && String(room.joinedBy) !== String(req.user?.id)) {
      res.status(403).json({ error: "Only participants can give ID/Pass" });
      return;
    }

    room.roomIdPass = roomId || roomIdPass || "";
    room.roomPass = roomPass || "";
    await room.save();

    const populated = await Room.findById(room._id)
      .populate("creator", "username uid points")
      .populate("joinedBy", "username uid points");

    res.json({ room: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/rooms/:id/finish
router.post("/:id/finish", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if (String(room.creator) !== String(req.user?.id)) {
      res.status(403).json({ error: "Only creator can finish" });
      return;
    }

    room.status = "finished";
    await room.save();

    const populated = await Room.findById(room._id)
      .populate("creator", "username uid points")
      .populate("joinedBy", "username uid points");

    res.json({ room: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/rooms/:id/cancel
router.post("/:id/cancel", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if (String(room.creator) !== String(req.user?.id)) {
      res.status(403).json({ error: "Only creator can cancel" });
      return;
    }

    const creator = await User.findById(room.creator);
    if (creator) {
      creator.points += room.fee;
      await creator.save();

      await Transaction.create({
        user: creator._id,
        type: "admin_credit",
        amount: room.fee,
        balanceBefore: creator.points - room.fee,
        balanceAfter: creator.points,
        room: room._id,
        description: `Refund for cancelled room "${room.name}"`,
      });
    }

    if (room.joinedBy) {
      const joiner = await User.findById(room.joinedBy);
      if (joiner) {
        joiner.points += room.fee;
        await joiner.save();

        await Transaction.create({
          user: joiner._id,
          type: "admin_credit",
          amount: room.fee,
          balanceBefore: joiner.points - room.fee,
          balanceAfter: joiner.points,
          room: room._id,
          description: `Refund for cancelled room "${room.name}"`,
        });
      }
    }

    room.status = "cancelled";
    await room.save();

    res.json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/rooms/:id/close
router.post("/:id/close", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if (String(room.creator) !== String(req.user?.id) && String(room.joinedBy) !== String(req.user?.id)) {
      res.status(403).json({ error: "Only participants can close the room" });
      return;
    }

    room.status = "finished";
    await room.save();

    const populated = await Room.findById(room._id)
      .populate("creator", "username uid points")
      .populate("joinedBy", "username uid points");

    res.json({ room: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/rooms/:id
router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if (String(room.creator) !== String(req.user?.id)) {
      res.status(403).json({ error: "Only creator can delete" });
      return;
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
