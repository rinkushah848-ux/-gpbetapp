import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest {
  headers: Record<string, string | string[] | undefined>;
  body: any;
  params: Record<string, string>;
  query: Record<string, any>;
  user?: {
    id: string;
    username: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = typeof authHeader === "string" ? authHeader.split(" ")[1] : undefined;

    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret"
    ) as { id: string; username: string };

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
