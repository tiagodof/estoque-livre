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

// GET /api/reports/stock-value — stock value grouped by category
router.get("/stock-value", authenticate, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT c.name AS category, SUM(p.unit_price * p.stock_quantity) AS total_value, COUNT(p.id) AS product_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    GROUP BY p.category_id
    ORDER BY total_value DESC
  `).all();
  res.json(rows);
});

// GET /api/reports/movements-summary?days=30
router.get("/movements-summary", authenticate, (req, res) => {
  const db = getDb();
  const days = parseInt(req.query.days) || 30;
  const rows = db.prepare(`
    SELECT type, COUNT(*) AS count, SUM(quantity) AS total_quantity
    FROM stock_movements
    WHERE created_at >= datetime('now', ?)
    GROUP BY type
  `).all(`-${days} days`);
  res.json({ period_days: days, data: rows });
});

// GET /api/reports/export/products.csv
router.get("/export/products.csv", authenticate, (req, res) => {
  const db = getDb();
  const products = db.prepare(`
    SELECT p.sku, p.name, c.name AS category, s.name AS supplier,
           p.stock_quantity, p.min_stock, p.unit_price,
           ROUND(p.unit_price * p.stock_quantity, 2) AS stock_value
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    ORDER BY p.name
  `).all();

  const header = "SKU,Name,Category,Supplier,Stock Qty,Min Stock,Unit Price,Stock Value";
  const rows = products.map((p) =>
    [p.sku, `"${p.name}"`, p.category || "", p.supplier || "",
     p.stock_quantity, p.min_stock, p.unit_price, p.stock_value].join(",")
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=products.csv");
  res.send([header, ...rows].join("\n"));
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
