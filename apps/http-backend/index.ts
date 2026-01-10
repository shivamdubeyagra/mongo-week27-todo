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

// ---------- Home Page (HTML + CSS) ----------
app.get("/", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html");

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Turbo Backend</title>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Inter, Arial, sans-serif;
    }

    body {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .card {
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(14px);
      padding: 40px;
      border-radius: 18px;
      width: 90%;
      max-width: 420px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.25);
    }

    h1 {
      font-size: 2.2rem;
      margin-bottom: 10px;
    }

    p {
      opacity: 0.9;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .status {
      display: inline-block;
      background: #22c55e;
      color: #062e16;
      padding: 8px 16px;
      border-radius: 999px;
      font-weight: 600;
      margin-bottom: 25px;
    }

    form {
      margin-top: 20px;
      text-align: left;
    }

    label {
      font-size: 0.85rem;
      opacity: 0.85;
    }

    input {
      width: 100%;
      padding: 12px;
      margin-top: 6px;
      margin-bottom: 14px;
      border-radius: 10px;
      border: none;
      outline: none;
      font-size: 0.95rem;
    }

    button {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      border: none;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      background: #22c55e;
      color: #062e16;
      transition: all 0.25s ease;
    }

    button:hover {
      background: #16a34a;
      transform: translateY(-1px);
    }

    .message {
      margin-top: 15px;
      font-size: 0.9rem;
    }

    .links a {
      display: block;
      text-decoration: none;
      color: white;
      border: 1px solid rgba(255,255,255,0.4);
      padding: 12px;
      border-radius: 10px;
      margin-top: 12px;
      transition: all 0.25s ease;
    }

    .links a:hover {
      background: white;
      color: #4f46e5;
    }

    footer {
      margin-top: 30px;
      font-size: 0.85rem;
      opacity: 0.7;
    }
  </style>
</head>

<body>
  <div class="card">
    <h1>🚀 Turbo Backend</h1>
    <p>Express + Mongo backend running securely in Docker.</p>

    <div class="status">✅ Server is Healthy</div>

    <form id="userForm">
      <label>Name</label>
      <input type="text" id="name" placeholder="Enter name" required />

      <label>Email</label>
      <input type="email" id="email" placeholder="Enter email" required />

      <button type="submit">Add User</button>
      <div class="message" id="message"></div>
    </form>

    <div class="links">
      <a href="/users">View Users (JSON)</a>
      <a href="/health">Health Check</a>
    </div>

    <footer>
      Powered by Express · MongoDB · Docker · HTTPS
    </footer>
  </div>

  <script>
    const form = document.getElementById("userForm");
    const message = document.getElementById("message");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;

      message.textContent = "Saving user...";
      message.style.color = "#fff";

      try {
        const res = await fetch("/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, email })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Something went wrong");
        }

        message.textContent = "✅ User added successfully";
        message.style.color = "#22c55e";
        form.reset();
      } catch (err) {
        message.textContent = "❌ " + err.message;
        message.style.color = "#f87171";
      }
    });
  </script>
</body>
</html>
  `);
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
