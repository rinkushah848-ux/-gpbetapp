import { Router, Response } from "express";
import Game from "../models/Game";
import Room from "../models/Room";
import User from "../models/User";
import Transaction from "../models/Transaction";
import UserNotification from "../models/UserNotification";
import { sendPushToUser } from "./push";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

// POST /api/games/upload-screenshot
router.post("/upload-screenshot", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId, screenshot, message } = req.body;
    if (!roomId || !screenshot) {
      res.status(400).json({ error: "Room ID and screenshot are required" });
      return;
    }

    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    let game = await Game.findOne({ room: roomId });
    if (!game) {
      game = new Game({
        room: roomId,
        player1: room.creator,
        player2: room.joinedBy,
        status: "screenshot_uploaded",
      });
    }

    const userId = String(req.user?.id);
    const isCreator = String(room.creator) === userId;
    const isJoiner = room.joinedBy && String(room.joinedBy) === userId;

    if (!isCreator && !isJoiner) {
      res.status(403).json({ error: "Not a participant" });
      return;
    }

    if (isCreator) {
      game.screenshot1 = screenshot;
      game.message1 = message || "";
    } else {
      game.screenshot2 = screenshot;
      game.message2 = message || "";
    }

    if (game.screenshot1 && game.screenshot2) {
      game.status = "review";
    } else {
      game.status = "screenshot_uploaded";
    }

    await game.save();
    res.json({ game });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/games/review/:roomId
router.get("/review/:roomId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const game = await Game.findOne({ room: req.params.roomId })
      .populate("player1", "username uid points")
      .populate("player2", "username uid points")
      .populate("winner", "username uid points");

    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    res.json({ game });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/games/pending-review
router.get("/pending-review", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }

    const games = await Game.find({ status: "review" })
      .populate("player1", "username uid points")
      .populate("player2", "username uid points")
      .populate({
        path: "room",
        populate: { path: "creator", select: "username uid" },
      })
      .sort({ createdAt: -1 });

    res.json({ games });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/games/approve/:gameId
router.post("/approve/:gameId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { winnerId } = req.body;
    if (!winnerId) {
      res.status(400).json({ error: "Winner ID is required" });
      return;
    }

    const user = await User.findById(req.user?.id);
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }

    const game = await Game.findById(req.params.gameId);
    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }
    if (game.status !== "review") {
      res.status(400).json({ error: "Game is not in review status" });
      return;
    }

    const room = await Room.findById(game.room);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    const winner = await User.findById(winnerId);
    if (!winner) {
      res.status(404).json({ error: "Winner not found" });
      return;
    }

    const totalPool = room.fee * 2;
    winner.points += totalPool;
    await winner.save();

    game.winner = winner._id;
    game.reviewedBy = user._id;
    game.reviewedAt = new Date();
    game.status = "completed";
    game.pointsAwarded = totalPool;
    await game.save();

    room.status = "finished";
    room.winner = winner._id;
    await room.save();

    await Transaction.create({
      user: winner._id,
      type: "game_win",
      amount: totalPool,
      balanceBefore: winner.points - totalPool,
      balanceAfter: winner.points,
      room: room._id,
      description: `Won match "${room.name}"`,
    });

    await UserNotification.create({
      userId: winner._id,
      type: "game_win",
      title: "🏆 You Won!",
      message: `You won the match "${room.name}" and earned +${totalPool} pts!`,
      relatedId: String(room._id),
    });
    await sendPushToUser(String(winner._id), "🏆 You Won!", `You won "${room.name}" +${totalPool} pts!`, "/freefire");

    const loserId =
      String(room.creator) === String(winner._id)
        ? room.joinedBy
        : room.creator;
    if (loserId) {
      await UserNotification.create({
        userId: loserId,
        type: "game_win",
        title: "Match Completed",
        message: `The match "${room.name}" has been completed. Winner: ${winner.username}`,
        relatedId: String(room._id),
      });
      await sendPushToUser(String(loserId), "Match Completed", `"${room.name}" winner: ${winner.username}`, "/freefire");
    }

    res.json({ game });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
