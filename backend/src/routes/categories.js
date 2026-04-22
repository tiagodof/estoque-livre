const express = require("express");
const { getDb } = require("../models/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  const db = getDb();
  res.json(db.prepare("SELECT * FROM categories ORDER BY name").all());
});

router.post("/", authenticate, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const db = getDb();
  try {
    const result = db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    if (err.message.includes("UNIQUE")) return res.status(409).json({ error: "Category already exists" });
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticate, (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.json({ message: "Category deleted" });
});

module.exports = router;
