const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getDb } = require("../models/db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret_in_production";

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// POST /api/auth/register (admin only in production)
router.post("/register", (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const hash = bcrypt.hashSync(password, 10);
  const db = getDb();

  try {
    const result = db.prepare(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)"
    ).run(username, hash, role || "viewer");
    res.status(201).json({ id: result.lastInsertRowid, message: "User created" });
  } catch (err) {
    if (err.message.includes("UNIQUE")) return res.status(409).json({ error: "Username already taken" });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
