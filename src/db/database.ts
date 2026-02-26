import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

import dotenv from "dotenv";

dotenv.config();

const dbPath = path.resolve(process.cwd(), process.env.DB_PATH || "database.sqlite");

export let dbError: string | null = null;

const initConnection = () => {
  try {
    // Attempt database connection
    const conn = new Database(dbPath, { fileMustExist: false });
    console.log(`[Database] Successfully connected to database using credentials from .env`);
    return conn;
  } catch (error: any) {
    console.error(`\n===========================================`);
    console.error(`❌ [DATABASE CONNECTION ERROR] ❌`);
    console.error(`Failed to connect to the database.`);
    console.error(`Error Details: ${error.message}`);
    console.error(`===========================================\n`);
    dbError = "Database Connection Error: Cannot reach the database. Please contact support or verify database credentials.";
    return null;
  }
};

export const db = initConnection();

export function initDb() {
  if (!db || dbError) return;
  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'employee',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      services TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      client_id INTEGER,
      doer_id INTEGER,
      remarks TEXT,
      frequency TEXT,
      due_date_logic TEXT,
      due_date DATETIME,
      status TEXT DEFAULT 'Not Started',
      completed_at DATETIME,
      auditor_id INTEGER,
      audit_status TEXT DEFAULT 'Pending',
      audit_remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(client_id) REFERENCES clients(id),
      FOREIGN KEY(doer_id) REFERENCES users(id),
      FOREIGN KEY(auditor_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS task_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      user_id INTEGER,
      user_name TEXT,
      action TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(task_id) REFERENCES tasks(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
}
