import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { authenticate } from "./auth";

const router = Router();

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("FATAL: JWT_SECRET environment variable is missing.");
  }
  return secret;
};

// POST /users/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Username, email, and password are required",
      });
    }

    // Default to 'doctor' if role is not provided or invalid
    const userRole = role === "admin" ? "admin" : "doctor";

    // Check if username or email already exists
    const [existing]: any = await db.execute(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Username or email already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const [result]: any = await db.execute(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [username, email, passwordHash, userRole]
    );

    res.status(201).json({
      message: "User created successfully",
      id: result.insertId,
      role: userRole,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// POST /users/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    // Select 'role' along with id, username, and password_hash
    const [rows]: any = await db.execute(
      `SELECT id, username, password_hash, role
       FROM users
       WHERE username = ?`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    const user = rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    // Include 'role' in the signed JWT payload
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      getJwtSecret(),
      {
        expiresIn: "24h",
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// GET /users/me
router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;

    // Guard check
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const [rows]: any = await db.execute(
      `SELECT id, username, email, role, created_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;