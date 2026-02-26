import { Router } from "express";
import { dbService } from "../services/dbService.js";
import jwt from "jsonwebtoken";
import { calculateNextDueDate } from "../utils/dateCalculator.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";

// Helper to get user from request
const getUserFromReq = (req: any) => {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
};

router.get("/", async (req, res) => {
  try {
    res.json(await dbService.getAllTasks());
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.post("/", async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  try {
    const user = getUserFromReq(req);
    // Initialize due_date according to frequency
    let initialDueDate = null;
    if (req.body.frequency && req.body.frequency !== "One Time") {
      initialDueDate = calculateNextDueDate(new Date(), req.body.frequency, req.body.due_date_logic || {});
    } else if (req.body.due_date_logic?.date) {
      initialDueDate = new Date(req.body.due_date_logic.date).toISOString();
    }

    const newTask = await dbService.createTask({ ...req.body, due_date: initialDueDate });

    if (user) {
      await dbService.logTaskHistory(newTask.id, user.id, user.name, "Created", "Task created");
    }
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const completedAt = ['Completed', 'Completed Late'].includes(status) ? new Date().toISOString() : null;

    const user = getUserFromReq(req);
    const userName = user ? user.name : "System";

    const oldTask = await dbService.getTaskById(Number(id)) as any;

    await dbService.updateTaskStatus(Number(id), status, completedAt);
    await dbService.logTaskHistory(Number(id), user?.id || null, userName, "Status Updated", `Status changed to ${status}`);

    // If completed and recurring, schedule next
    if (['Completed', 'Completed Late'].includes(status) && oldTask.frequency !== "One Time") {
      const logicData = typeof oldTask.due_date_logic === 'string' ? JSON.parse(oldTask.due_date_logic || '{}') : oldTask.due_date_logic || {};
      const baseDate = oldTask.due_date || completedAt || new Date().toISOString();
      const nextDueDate = calculateNextDueDate(baseDate, oldTask.frequency, logicData);

      const nextTask = await dbService.createTask({
        title: oldTask.title,
        client_id: oldTask.client_id,
        doer_id: oldTask.doer_id,
        remarks: oldTask.remarks,
        frequency: oldTask.frequency,
        due_date_logic: logicData,
        due_date: nextDueDate,
        status: "Not Started"
      });
      await dbService.logTaskHistory(nextTask.id, null, "System", "Auto-Generated", `Task auto-generated from recurring parent task #${oldTask.id}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Failed to update task status" });
  }
});

router.put("/:id/audit", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, audit_status, audit_remarks } = req.body;

    const user = getUserFromReq(req);
    const userName = user ? user.name : "System";

    await dbService.updateTaskAudit(Number(id), status, audit_status, audit_remarks);
    await dbService.logTaskHistory(Number(id), user?.id || null, userName, "Audit Updated", `Audit status changed to ${audit_status}`);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update task audit status" });
  }
});

router.get("/:id/history", async (req, res) => {
  try {
    const { id } = req.params;
    res.json(await dbService.getTaskHistory(Number(id)));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch task history" });
  }
});

export default router;
