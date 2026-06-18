import { Router, Response } from "express";
import User from "../models/User";
import Transaction from "../models/Transaction";
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

export default router;
