import express from "express";
import type { Request, Response, NextFunction } from "express";

import cors from "cors";
import "dotenv/config";

import { connectDB, User } from "@repo/db";

const app = express();

// ---------- Middlewares ----------
app.use(cors());
app.use(express.json());

// ---------- Routes ----------
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// GET users
app.get("/users", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// ✅ POST users
app.post("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;

    // simple validation
    if (!name || !email) {
      return res.status(400).json({
        message: "name and email are required",
      });
    }

    const user = await User.create({ name, email });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// ---------- Error Handler ----------
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
);

// ---------- Server Bootstrap ----------
async function startServer() {
  try {
    await connectDB();

    const PORT = Number(process.env.PORT) || 4000;
    app.listen(PORT, () => {
      console.log(`HTTP backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
