import { Router, Response } from "express";
import User from "../models/User";
import Transaction from "../models/Transaction";
import WithdrawRequest from "../models/WithdrawRequest";
import DepositRequest from "../models/DepositRequest";
import UserNotification from "../models/UserNotification";
import { sendPushToUser } from "./push";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

function isAdmin(req: AuthRequest, res: Response): boolean {
  if ((req.user as any)?.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return false;
  }
  return true;
}

// GET /api/admin/users
router.get("/users", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/credit
router.post("/credit", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }

    const { userId, amount, description } = req.body;
    if (!userId || !amount || amount <= 0) {
      res.status(400).json({ error: "Valid userId and amount required" });
      return;
    }

    const target = await User.findById(userId);
    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const before = target.points;
    target.points += amount;
    await target.save();

    await Transaction.create({
      user: target._id,
      type: "admin_credit",
      amount,
      balanceBefore: before,
      balanceAfter: target.points,
      description: description || "Admin credit",
    });

    await UserNotification.create({
      userId: target._id,
      type: "points_credit",
      title: "💰 Points Credited",
      message: `You received +${amount} pts${description ? `: ${description}` : ""}`,
    });
    await sendPushToUser(String(target._id), "💰 Points Credited", `+${amount} pts${description ? `: ${description}` : ""}`, "/home");

    res.json({ user: target.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/debit
router.post("/debit", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }

    const { userId, amount, description } = req.body;
    if (!userId || !amount || amount <= 0) {
      res.status(400).json({ error: "Valid userId and amount required" });
      return;
    }

    const target = await User.findById(userId);
    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (target.points < amount) {
      res.status(400).json({ error: "Insufficient points" });
      return;
    }

    const before = target.points;
    target.points -= amount;
    await target.save();

    await Transaction.create({
      user: target._id,
      type: "admin_debit",
      amount,
      balanceBefore: before,
      balanceAfter: target.points,
      description: description || "Admin debit",
    });

    res.json({ user: target.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/admin/transactions
router.get("/transactions", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }

    const transactions = await Transaction.find()
      .populate("user", "username uid")
      .populate("room", "name")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/ban
router.post("/ban", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admin = await User.findById(req.user?.id);
    if (!admin || admin.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }

    const { userId, reason } = req.body;
    if (!userId) {
      res.status(400).json({ error: "userId required" });
      return;
    }

    const target = await User.findById(userId);
    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    target.isBanned = true;
    target.banReason = reason || "Banned by admin";
    await target.save();

    await UserNotification.create({
      userId: target._id,
      type: "system",
      title: "🚫 Account Banned",
      message: `Your account has been banned. Reason: ${target.banReason}`,
    });

    res.json({ user: target.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/unban
router.post("/unban", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admin = await User.findById(req.user?.id);
    if (!admin || admin.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }

    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: "userId required" });
      return;
    }

    const target = await User.findById(userId);
    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    target.isBanned = false;
    target.banReason = "";
    await target.save();

    res.json({ user: target.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---- WITHDRAW ----

// GET /api/admin/withdraws
router.get("/withdraws", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }
    const withdraws = await WithdrawRequest.find()
      .populate("user", "username uid points")
      .sort({ createdAt: -1 });
    res.json({ withdraws });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/withdraws/:id/accept
router.post("/withdraws/:id/accept", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admin = await User.findById(req.user?.id);
    if (!admin || admin.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }

    const withdraw = await WithdrawRequest.findById(req.params.id).populate("user");
    if (!withdraw) {
      res.status(404).json({ error: "Withdraw request not found" });
      return;
    }
    if (withdraw.status !== "pending") {
      res.status(400).json({ error: "Already processed" });
      return;
    }

    withdraw.status = "accepted";
    await withdraw.save();

    const wUser = withdraw.user as any;
    await Transaction.create({
      user: wUser._id,
      type: "withdraw",
      amount: -withdraw.amount,
      balanceBefore: wUser.points,
      balanceAfter: wUser.points,
      description: `Withdrawal accepted: ${withdraw.amount} pts to ${withdraw.upiId}`,
    });

    await UserNotification.create({
      userId: wUser._id,
      type: "system",
      title: "✅ Withdrawal Accepted",
      message: `Your withdrawal of ${withdraw.amount} pts has been accepted.`,
    });
    await sendPushToUser(String(wUser._id), "✅ Withdrawal Accepted", `${withdraw.amount} pts withdrawal approved!`, "/profile");

    res.json({ withdraw });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/withdraws/:id/reject
router.post("/withdraws/:id/reject", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admin = await User.findById(req.user?.id);
    if (!admin || admin.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }

    const withdraw = await WithdrawRequest.findById(req.params.id).populate("user");
    if (!withdraw) {
      res.status(404).json({ error: "Withdraw request not found" });
      return;
    }
    if (withdraw.status !== "pending") {
      res.status(400).json({ error: "Already processed" });
      return;
    }

    withdraw.status = "rejected";
    await withdraw.save();

    const wUser = withdraw.user as any;
    const target = await User.findById(wUser._id);
    if (target) {
      target.points += withdraw.amount;
      await target.save();
    }

    await UserNotification.create({
      userId: wUser._id,
      type: "system",
      title: "❌ Withdrawal Rejected",
      message: `Your withdrawal of ${withdraw.amount} pts has been rejected. Points refunded.`,
    });
    await sendPushToUser(String(wUser._id), "❌ Withdrawal Rejected", `Owner rejected your withdraw of ${withdraw.amount} pts. Points refunded.`, "/profile");

    res.json({ withdraw });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---- DEPOSIT ----

// GET /api/admin/deposits
router.get("/deposits", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }
    const deposits = await DepositRequest.find()
      .populate("user", "username uid points")
      .sort({ createdAt: -1 });
    res.json({ deposits });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/deposits/:id/approve
router.post("/deposits/:id/approve", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admin = await User.findById(req.user?.id);
    if (!admin || admin.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }

    const deposit = await DepositRequest.findById(req.params.id).populate("user");
    if (!deposit) {
      res.status(404).json({ error: "Deposit request not found" });
      return;
    }
    if (deposit.status !== "pending") {
      res.status(400).json({ error: "Already processed" });
      return;
    }

    deposit.status = "approved";
    await deposit.save();

    const dUser = deposit.user as any;
    const target = await User.findById(dUser._id);
    if (target) {
      const before = target.points;
      target.points += deposit.amount;
      await target.save();

      await Transaction.create({
        user: target._id,
        type: "deposit",
        amount: deposit.amount,
        balanceBefore: before,
        balanceAfter: target.points,
        description: `Deposit: ${deposit.amount} pts (UTR: ${deposit.utrNumber})`,
      });
    }

    await UserNotification.create({
      userId: dUser._id,
      type: "points_credit",
      title: "💰 Deposit Approved",
      message: `Your deposit of ${deposit.amount} pts has been approved!`,
    });
    await sendPushToUser(String(dUser._id), "💰 Deposit Approved", `+${deposit.amount} pts deposited!`, "/profile");

    res.json({ deposit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/deposits/:id/reject
router.post("/deposits/:id/reject", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admin = await User.findById(req.user?.id);
    if (!admin || admin.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }

    const deposit = await DepositRequest.findById(req.params.id).populate("user");
    if (!deposit) {
      res.status(404).json({ error: "Deposit request not found" });
      return;
    }
    if (deposit.status !== "pending") {
      res.status(400).json({ error: "Already processed" });
      return;
    }

    deposit.status = "rejected";
    await deposit.save();

    res.json({ deposit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
