import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express globally so req.user works everywhere cleanly
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: "admin" | "doctor";
      };
    }
  }
}

// Safely read secret inside functions to prevent startup crashes if env is missing
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("FATAL: JWT_SECRET environment variable is not defined.");
  }
  return secret;
};

// Authentication Middleware (Verifies User Identity)
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authorization header missing or malformed (expected 'Bearer <token>')",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as {
      id: number;
      username: string;
      role: "admin" | "doctor";
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};

// Authorization Middleware (Verifies User Roles)
export const authorize = (...allowedRoles: Array<"admin" | "doctor">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden: You do not have permission to access this resource",
      });
    }

    next();
  };
};