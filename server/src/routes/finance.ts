import { Router, Response } from "express";
import User from "../models/User";
import WithdrawRequest from "../models/WithdrawRequest";
import DepositRequest from "../models/DepositRequest";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

// POST /api/finance/withdraw
router.post("/withdraw", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, upiId, screenshot } = req.body;
    if (!amount || amount <= 0 || !upiId) {
      res.status(400).json({ error: "Valid amount and UPI ID required" });
      return;
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (user.isBanned) {
      res.status(403).json({ error: "Your account is banned" });
      return;
    }
    if (user.points < amount) {
      res.status(400).json({ error: "Insufficient points" });
      return;
    }

    // Deduct points immediately
    user.points -= amount;
    await user.save();

    const withdraw = await WithdrawRequest.create({
      user: user._id,
      username: user.username,
      amount,
      upiId,
      screenshot: screenshot || "",
    });

    res.json({ withdraw });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/finance/my-withdraws
router.get("/my-withdraws", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const withdraws = await WithdrawRequest.find({ user: req.user?.id }).sort({ createdAt: -1 });
    res.json({ withdraws });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/finance/deposit
router.post("/deposit", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, utrNumber } = req.body;
    if (!amount || amount <= 0 || !utrNumber) {
      res.status(400).json({ error: "Valid amount and UTR number required" });
      return;
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (user.isBanned) {
      res.status(403).json({ error: "Your account is banned" });
      return;
    }

    const deposit = await DepositRequest.create({
      user: user._id,
      username: user.username,
      amount,
      utrNumber,
    });

    res.json({ deposit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/finance/my-deposits
router.get("/my-deposits", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deposits = await DepositRequest.find({ user: req.user?.id }).sort({ createdAt: -1 });
    res.json({ deposits });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
