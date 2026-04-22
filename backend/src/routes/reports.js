const express = require("express");
const { getDb } = require("../models/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/reports/summary — overall stock summary
router.get("/summary", authenticate, (req, res) => {
  const db = getDb();

  const totalProducts  = db.prepare("SELECT COUNT(*) AS count FROM products").get().count;
  const totalValue     = db.prepare("SELECT SUM(unit_price * stock_quantity) AS total FROM products").get().total || 0;
  const lowStockCount  = db.prepare("SELECT COUNT(*) AS count FROM products WHERE stock_quantity <= min_stock").get().count;
  const totalMovements = db.prepare("SELECT COUNT(*) AS count FROM stock_movements").get().count;

  res.json({ totalProducts, totalValue, lowStockCount, totalMovements });
});

// GET /api/reports/movements/csv — export movements as CSV
router.get("/movements/csv", authenticate, (req, res) => {
  const db = getDb();
  const movements = db.prepare(`
    SELECT m.created_at, p.sku, p.name AS product, m.type, m.quantity, m.note, u.username
    FROM stock_movements m
    LEFT JOIN products p ON m.product_id = p.id
    LEFT JOIN users u ON m.user_id = u.id
    ORDER BY m.created_at DESC
  `).all();

  const header = "Date,SKU,Product,Type,Quantity,Note,User\n";
  const rows = movements.map(r =>
    `"${r.created_at}","${r.sku}","${r.product}","${r.type}","${r.quantity}","${r.note || ""}","${r.username}"`
  ).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=movements.csv");
  res.send(header + rows);
});

module.exports = router;
