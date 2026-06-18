import { Router, Response } from "express";
import crypto from "crypto";
import User from "../models/User";
import DepositRequest from "../models/DepositRequest";
import Transaction from "../models/Transaction";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ESEWA_CONFIG } from "../config/esewa";

const router = Router();

router.use(authMiddleware);

function generateTransactionId(): string {
  return "ESEWA-" + crypto.randomUUID().replace(/-/g, "").substring(0, 16).toUpperCase();
}

// POST /api/esewa/initiate
router.post("/initiate", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    const parsed = parseInt(amount, 10);
    if (!parsed || parsed < 30 || parsed > 1000) {
      res.status(400).json({ error: "Amount must be between 30 and 1000 NPR" });
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

    const transactionUuid = generateTransactionId();

    await DepositRequest.create({
      user: user._id,
      username: user.username,
      amount: parsed,
      uuid: transactionUuid,
      status: "pending",
    });

    const formData = {
      amt: parsed,
      psc: 0,
      pdc: 0,
      txAmt: 0,
      tAmt: parsed,
      pid: transactionUuid,
      scd: ESEWA_CONFIG.merchantId,
      su: ESEWA_CONFIG.successUrl,
      fu: ESEWA_CONFIG.failureUrl,
    };

    res.json({ formData, gatewayUrl: ESEWA_CONFIG.gatewayUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/esewa/success
router.get("/success", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { oid, amt, refId } = req.query;

    if (!oid || !amt || !refId) {
      res.redirect(`${ESEWA_CONFIG.failureUrl}&error=missing_params`);
      return;
    }

    const deposit = await DepositRequest.findOne({ uuid: oid as string });
    if (!deposit) {
      res.redirect(`${ESEWA_CONFIG.failureUrl}&error=deposit_not_found`);
      return;
    }

    if (deposit.status !== "pending") {
      res.redirect(`${ESEWA_CONFIG.failureUrl}&error=already_processed`);
      return;
    }

    // Verify with eSewa
    const verifyBody = new URLSearchParams({
      amt: amt as string,
      refId: refId as string,
      oid: oid as string,
      scd: ESEWA_CONFIG.merchantId,
    });

    const verifyRes = await fetch(ESEWA_CONFIG.verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyBody.toString(),
    });

    const verifyText = await verifyRes.text();
    const isVerified = verifyText.includes("Success") || verifyText.includes("<response_code>Success</response_code>");

    if (!isVerified) {
      deposit.status = "rejected";
      await deposit.save();
      res.redirect(`${ESEWA_CONFIG.failureUrl}&error=verification_failed`);
      return;
    }

    const user = await User.findById(deposit.user);
    if (!user) {
      res.redirect(`${ESEWA_CONFIG.failureUrl}&error=user_not_found`);
      return;
    }

    const pointsToCredit = deposit.amount;

    deposit.status = "approved";
    await deposit.save();

    const balanceBefore = user.points;
    user.points += pointsToCredit;
    await user.save();

    await Transaction.create({
      user: user._id,
      type: "deposit",
      amount: pointsToCredit,
      balanceBefore,
      balanceAfter: user.points,
      description: `eSewa deposit of NPR ${deposit.amount} (Ref: ${refId})`,
    });

    res.redirect(`http://localhost:3000/profile?deposit=success&amount=${deposit.amount}&points=${pointsToCredit}`);
  } catch (err) {
    console.error(err);
    res.redirect(`${ESEWA_CONFIG.failureUrl}&error=server_error`);
  }
});

export default router;
