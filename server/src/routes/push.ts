import { Router, Response } from "express";
import webpush from "web-push";
import PushSubscription from "../models/PushSubscription";
import UserNotification from "../models/UserNotification";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

const publicVapidKey =
  process.env.VAPID_PUBLIC_KEY ||
  "BCqY9FxHK-7k68m0NvEEJh8jFst9TwEizT3552w_W2nYrnoZCsDG9KNzfAQ-bc3ORVlYStOT6Uuakzm6nl32hZg";
const privateVapidKey =
  process.env.VAPID_PRIVATE_KEY ||
  "62Qnj2fBpkjqPJwfzib8iiU87iX4iWZ5lIuzN_hoLD0";

webpush.setVapidDetails(
  "mailto:admin@gpbetapp.com",
  publicVapidKey,
  privateVapidKey
);

// POST /api/push/subscribe
router.post("/subscribe", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ error: "Invalid subscription" });
      return;
    }
    await PushSubscription.findOneAndUpdate(
      { userId: req.user?.id, endpoint },
      { endpoint, keys, userId: req.user?.id },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/push/unsubscribe
router.delete("/unsubscribe", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { endpoint } = req.body;
    await PushSubscription.findOneAndDelete({ userId: req.user?.id, endpoint });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/push/send — send push to user
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  url?: string
) {
  try {
    const subs = await PushSubscription.find({ userId });
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
          },
          JSON.stringify({ title, body, url: url || "/" }),
          { TTL: 86400 }
        );
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.findByIdAndDelete(sub._id);
        }
      }
    }
  } catch (err) {
    console.error("Push send error:", err);
  }
}

export default router;
