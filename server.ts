import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import { initDb, dbError } from "./src/db/database.js";
import clientRoutes from "./src/api/clients.js";
import authRoutes from "./src/api/auth.js";
import userRoutes from "./src/api/users.js";
import taskRoutes from "./src/api/tasks.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Initialize database
  initDb();

  // API Check Middleware
  app.use("/api", (req, res, next) => {
    // Let health pass without DB occasionally, or checking it
    if (req.path === '/health') return next();

    if (dbError) {
      return res.status(503).json({
        error: "Service Unavailable",
        message: dbError
      });
    }
    next();
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/clients", clientRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/tasks", taskRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
