import { Router, Response } from "express";
import Notification from "../models/Notification";
import UserNotification from "../models/UserNotification";
import User from "../models/User";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

// GET /api/notifications — system announcements + user notifications + inactivity
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);

    const announcements = await Notification.find({
      $or: [
        { targetUsers: { $in: [req.user?.id || ""] } },
        { targetUsers: { $size: 0 } },
      ],
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 }).limit(5);

    const userNotifs = await UserNotification.find({
      userId: req.user?.id,
    }).sort({ createdAt: -1 }).limit(20);

    const unreadCount = await UserNotification.countDocuments({
      userId: req.user?.id,
      read: false,
    });

    const daysInactive = user
      ? Math.floor(
          (Date.now() - new Date(user.lastActive).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    if (user) {
      user.lastActive = new Date();
      await user.save();
    }

    res.json({
      announcements,
      userNotifications: userNotifs,
      unreadCount,
      inactivity: {
        daysInactive,
        showMessage: daysInactive >= 1,
        message:
          daysInactive >= 1
            ? `We miss you! You haven't been online for ${daysInactive} day${daysInactive > 1 ? "s" : ""}.`
            : null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/notifications/unread-count
router.get("/unread-count", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await UserNotification.countDocuments({
      userId: req.user?.id,
      read: false,
    });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/notifications/read-all — mark all as read
router.post("/read-all", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await UserNotification.updateMany(
      { userId: req.user?.id, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/notifications/:id/read — mark one as read
router.post("/:id/read", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await UserNotification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/notifications (admin only) — create announcement
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }

    const { title, message, type, targetUsers } = req.body;
    if (!title || !message) {
      res.status(400).json({ error: "Title and message required" });
      return;
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || "system",
      targetUsers: targetUsers || [],
    });

    res.status(201).json({ notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
