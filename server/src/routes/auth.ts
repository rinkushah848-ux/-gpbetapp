import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    // Find user by username
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    user.lastActive = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "your_secret",
      { expiresIn: "7d" }
    );

    // Return token and user data
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        uid: user.uid,
        points: user.points,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/admin-login — hardcoded admin credentials, auto-creates account
router.post("/admin-login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (username !== "gpbetadmin" || password !== "vampire9090") {
      res.status(401).json({ error: "Invalid admin credentials" });
      return;
    }
    let user = await User.findOne({ username: "gpbetadmin" });
    if (!user) {
      user = await User.create({
        username: "gpbetadmin",
        password: "vampire9090",
        uid: "123456",
        points: 0,
        role: "admin",
      });
    }
    if (user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "your_secret",
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        uid: user.uid,
        points: user.points,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, uid } = req.body;

    // Validate input
    if (!username || !password || !uid) {
      res.status(400).json({ error: "Username, password, and UID are required" });
      return;
    }

    // Validate username length
    if (username.length < 3) {
      res.status(400).json({ error: "Username must be at least 3 characters" });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ error: "Username already taken" });
      return;
    }

    // Check if UID already exists
    const existingUID = await User.findOne({ uid });
    if (existingUID) {
      res.status(400).json({ error: "This Game UID is already registered" });
      return;
    }

    // Create new user
    const newUser = new User({
      username: username.toLowerCase(),
      password,
      uid,
      points: 0,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET || "your_secret",
      { expiresIn: "7d" }
    );

    // Return token and user data
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        uid: newUser.uid,
        points: newUser.points,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// GET /api/auth/me (Protected route)
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        uid: user.uid,
        points: user.points,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
