const express = require("express");
const { getDb } = require("../models/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  const db = getDb();
  res.json(db.prepare("SELECT * FROM suppliers ORDER BY name").all());
});

router.post("/", authenticate, (req, res) => {
  const { name, contact, email, phone } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const db = getDb();
  const result = db.prepare(
    "INSERT INTO suppliers (name, contact, email, phone) VALUES (?, ?, ?, ?)"
  ).run(name, contact, email, phone);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put("/:id", authenticate, (req, res) => {
  const { name, contact, email, phone } = req.body;
  const db = getDb();
  db.prepare("UPDATE suppliers SET name=?, contact=?, email=?, phone=? WHERE id=?")
    .run(name, contact, email, phone, req.params.id);
  res.json({ message: "Supplier updated" });
});

router.delete("/:id", authenticate, (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM suppliers WHERE id = ?").run(req.params.id);
  res.json({ message: "Supplier deleted" });
});

module.exports = router;
