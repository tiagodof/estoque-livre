const express = require("express");
const { getDb } = require("../models/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/movements?page=1&limit=20&product_id=&type=
router.get("/", authenticate, (req, res) => {
  const db = getDb();
  const { page = 1, limit = 20, product_id, type } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = "WHERE 1=1";
  const params = [];

  if (product_id) {
    where += " AND m.product_id = ?";
    params.push(product_id);
  }
  if (type && ["in", "out", "adjustment"].includes(type)) {
    where += " AND m.type = ?";
    params.push(type);
  }

  const total = db.prepare(`
    SELECT COUNT(*) AS count FROM stock_movements m ${where}
  `).get(...params).count;

  const movements = db.prepare(`
    SELECT m.*, p.name AS product_name, p.sku, u.username
    FROM stock_movements m
    LEFT JOIN products p ON m.product_id = p.id
    LEFT JOIN users u ON m.user_id = u.id
    ${where}
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  res.json({
    data: movements,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// POST /api/movements
router.post("/", authenticate, (req, res) => {
  const { product_id, type, quantity, note } = req.body;
  if (!product_id || !type || !quantity) {
    return res.status(400).json({ error: "product_id, type, and quantity are required" });
  }
  if (!["in", "out", "adjustment"].includes(type)) {
    return res.status(400).json({ error: "type must be in, out, or adjustment" });
  }
  if (quantity <= 0) {
    return res.status(400).json({ error: "quantity must be a positive number" });
  }

  const db = getDb();
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(product_id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const delta = type === "out" ? -Math.abs(quantity) : Math.abs(quantity);
  const newQty = product.stock_quantity + delta;
  if (newQty < 0) return res.status(400).json({ error: "Insufficient stock" });

  const insertMovement = db.prepare(`
    INSERT INTO stock_movements (product_id, user_id, type, quantity, note)
    VALUES (?, ?, ?, ?, ?)
  `);
  const updateStock = db.prepare(`
    UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);

  db.transaction(() => {
    insertMovement.run(product_id, req.user.id, type, quantity, note);
    updateStock.run(newQty, product_id);
  })();

  res.status(201).json({ message: "Movement recorded", new_quantity: newQty });
});

module.exports = router;
