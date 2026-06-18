import express, { Express } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import authRoutes from "./routes/auth";
import roomRoutes from "./routes/rooms";
import gameRoutes from "./routes/games";
import adminRoutes from "./routes/admin";

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
app.use("/api/admin", adminRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✓ Connected to MongoDB");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✓ Server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("✗ MongoDB connection error:", err);
    process.exit(1);
  });

export default app;
