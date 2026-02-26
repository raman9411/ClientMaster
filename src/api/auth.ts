import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbService } from "../services/dbService.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";

// Sign Up
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    // Check if user exists
    const existingUser = dbService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Check if it's the first user ever
    const allUsers = dbService.getAllUsers();
    let finalRole = role || 'employee';
    if (allUsers.length === 0) {
      finalRole = 'admin'; // First user is automatically assigned as admin
    }

    // Insert user
    const newUser = await dbService.createUser({ name, email, password, role: finalRole });

    // Create token
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "1d" });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Sign In
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = dbService.getUserByEmail(email) as any;
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ error: "Failed to sign in" });
  }
});

// Get Current User
router.get("/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = dbService.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

export default router;
