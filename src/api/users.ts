import { Router } from "express";
import { dbService } from "../services/dbService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const role = req.query.role as string;
    if (role) {
      res.json(await dbService.getUsersByRole(role));
    } else {
      res.json(await dbService.getAllUsers());
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    const newUser = await dbService.createUser({ name, email, password, role });
    res.status(201).json(newUser);
  } catch (error: any) {
    if (error.code === '23505') { // Postgres unique violation (email)
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.put("/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    await dbService.updateUserRole(Number(id), role);
    res.json({ success: true, message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await dbService.deleteUser(Number(id));
    if (success) {
      res.json({ success: true, message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
