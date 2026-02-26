import { db } from "../db/database.js";
import bcrypt from "bcryptjs";

export const dbService = {
  // Users
  getUserByEmail: (email: string) => db.prepare("SELECT * FROM users WHERE email = ?").get(email),
  getUserById: (id: number) => db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(id),
  getUsersByRole: (role: string) => db.prepare("SELECT id, name, email, role FROM users WHERE role = ?").all(role),
  getAllUsers: () => db.prepare("SELECT id, name, email, role FROM users").all(),
  updateUserRole: (id: number, role: string) => {
    return db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, id);
  },
  createUser: async (user: any) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const info = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(user.name, user.email, hashedPassword, user.role || 'employee');
    return db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(info.lastInsertRowid);
  },
  deleteUser: (id: number) => {
    const info = db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return info.changes > 0;
  },

  // Clients
  getAllClients: () => db.prepare("SELECT * FROM clients ORDER BY created_at DESC").all(),
  getClientById: (id: number) => db.prepare("SELECT * FROM clients WHERE id = ?").get(id),
  createClient: (client: any) => {
    const servicesStr = Array.isArray(client.services) ? JSON.stringify(client.services) : (client.services || "[]");
    const info = db.prepare(`
      INSERT INTO clients (name, contact_person, email, phone, services)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      client.name,
      client.contact_person || "",
      client.email || "",
      client.phone || "",
      servicesStr
    );
    return db.prepare("SELECT * FROM clients WHERE id = ?").get(info.lastInsertRowid);
  },
  updateClient: (id: number, client: any) => {
    const servicesStr = Array.isArray(client.services) ? JSON.stringify(client.services) : (client.services || "[]");
    const info = db.prepare(`
      UPDATE clients 
      SET name = ?, contact_person = ?, email = ?, phone = ?, services = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      client.name,
      client.contact_person || "",
      client.email || "",
      client.phone || "",
      servicesStr,
      id
    );
    return info.changes > 0 ? db.prepare("SELECT * FROM clients WHERE id = ?").get(id) : null;
  },
  deleteClient: (id: number) => {
    const info = db.prepare("DELETE FROM clients WHERE id = ?").run(id);
    return info.changes > 0;
  },

  // Tasks
  getAllTasks: () => db.prepare(`
    SELECT t.*, c.name as client_name, u.name as doer_name 
    FROM tasks t 
    LEFT JOIN clients c ON t.client_id = c.id 
    LEFT JOIN users u ON t.doer_id = u.id 
    ORDER BY t.created_at DESC
  `).all(),
  getTaskById: (id: number) => db.prepare(`
    SELECT t.*, c.name as client_name, u.name as doer_name 
    FROM tasks t 
    LEFT JOIN clients c ON t.client_id = c.id 
    LEFT JOIN users u ON t.doer_id = u.id 
    WHERE t.id = ?
  `).get(id),
  createTask: (task: any) => {
    const info = db.prepare(`
      INSERT INTO tasks (title, client_id, doer_id, remarks, frequency, due_date_logic, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      task.title,
      task.client_id || null,
      task.doer_id || null,
      task.remarks || "",
      task.frequency || "One Time",
      task.due_date_logic ? JSON.stringify(task.due_date_logic) : "{}",
      task.due_date || null,
      task.status || "Not Started"
    );
    return db.prepare("SELECT * FROM tasks WHERE id = ?").get(info.lastInsertRowid);
  },
  updateTaskStatus: (id: number, status: string, completedAt: string | null) => {
    return db.prepare(`
      UPDATE tasks 
      SET status = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, completedAt, id);
  },
  updateTaskAudit: (id: number, status: string, auditStatus: string, auditRemarks: string) => {
    return db.prepare(`
      UPDATE tasks 
      SET status = ?, audit_status = ?, audit_remarks = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, auditStatus, auditRemarks, id);
  },
  logTaskHistory: (taskId: number, userId: number | null, userName: string, action: string, details: string) => {
    return db.prepare(`
      INSERT INTO task_history (task_id, user_id, user_name, action, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(taskId, userId, userName, action, details);
  },
  getTaskHistory: (taskId: number) => {
    return db.prepare("SELECT * FROM task_history WHERE task_id = ? ORDER BY created_at DESC").all(taskId);
  }
};
