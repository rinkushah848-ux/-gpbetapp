import express, { Express } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import authRoutes from "./routes/auth";
import roomRoutes from "./routes/rooms";
import gameRoutes from "./routes/games";
import notificationRoutes from "./routes/notifications";
import pushRoutes from "./routes/push";
import adminRoutes from "./routes/admin";
import financeRoutes from "./routes/finance";
import esewaRoutes from "./routes/esewa";
import Room from "./models/Room";
import UserNotification from "./models/UserNotification";
import { sendPushToUser } from "./routes/push";

dotenv.config();

// Workaround: some environments block SRV DNS queries from Node's resolver.
// Force Node to use a public DNS server (Google) for SRV lookups.
try {
  dns.setServers(["8.8.8.8"]);
  console.log("• DNS servers set to 8.8.8.8 for SRV resolution");
} catch (e) {
  console.warn("• Failed to set DNS servers; continuing with system defaults");
}

const app: Express = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gpbet-tournament";

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/esewa", esewaRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// App version (for update checking)
app.get("/api/app-version", (req, res) => {
  res.json({
    latestVersion: process.env.LATEST_APP_VERSION || "1.0.0",
    downloadUrl: process.env.APP_DOWNLOAD_URL || "https://gpbetapp.vercel.app",
    forceUpdate: true,
  });
});

const ROOM_EXPIRY_MINUTES = 15;

async function cleanupStaleRooms() {
  try {
    const cutoff = new Date(Date.now() - ROOM_EXPIRY_MINUTES * 60 * 1000);
    const stale = await Room.find({
      status: "active",
      joinedBy: null,
      createdAt: { $lt: cutoff },
    });
    for (const room of stale) {
      room.status = "cancelled";
      await room.save();
      console.log(`⏰ Auto-cancelled stale room: ${room.name} (${room._id})`);
      const creatorId = room.creator?.toString();
      if (creatorId) {
        await UserNotification.create({
          userId: creatorId,
          type: "room_cancelled",
          title: "Room Cancelled",
          message: `Your room "${room.name}" was auto-cancelled (no one joined in ${ROOM_EXPIRY_MINUTES} min).`,
          relatedId: room._id.toString(),
        });
        await sendPushToUser(creatorId, "Room Cancelled", `Room "${room.name}" auto-cancelled — no one joined.`, "/freefire");
      }
    }
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✓ Connected to MongoDB");

    cleanupStaleRooms();
    setInterval(cleanupStaleRooms, 5 * 60 * 1000);
    console.log(`⏰ Room cleanup every 5min (expiry: ${ROOM_EXPIRY_MINUTES}min)`);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✓ Server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("✗ MongoDB connection error:", err);
    process.exit(1);
  });

export default app;
