const express = require("express");
const { getDb } = require("../models/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/products
router.get("/", authenticate, (req, res) => {
  const db = getDb();
  const products = db.prepare(`
    SELECT p.*, c.name AS category_name, s.name AS supplier_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    ORDER BY p.name
  `).all();
  res.json(products);
});

// GET /api/products/low-stock
router.get("/low-stock", authenticate, (req, res) => {
  const db = getDb();
  const items = db.prepare(`
    SELECT * FROM products WHERE stock_quantity <= min_stock ORDER BY stock_quantity ASC
  `).all();
  res.json(items);
});

// GET /api/products/:id
router.get("/:id", authenticate, (req, res) => {
  const db = getDb();
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// POST /api/products
router.post("/", authenticate, (req, res) => {
  const { sku, name, description, category_id, supplier_id, unit_price, stock_quantity, min_stock } = req.body;
  if (!sku || !name) return res.status(400).json({ error: "SKU and name are required" });

  const db = getDb();
  try {
    const result = db.prepare(`
      INSERT INTO products (sku, name, description, category_id, supplier_id, unit_price, stock_quantity, min_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(sku, name, description, category_id, supplier_id, unit_price || 0, stock_quantity || 0, min_stock || 5);

    res.status(201).json({ id: result.lastInsertRowid, message: "Product created" });
  } catch (err) {
    if (err.message.includes("UNIQUE")) return res.status(409).json({ error: "SKU already exists" });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put("/:id", authenticate, (req, res) => {
  const { name, description, category_id, supplier_id, unit_price, min_stock } = req.body;
  const db = getDb();
  db.prepare(`
    UPDATE products SET name=?, description=?, category_id=?, supplier_id=?, unit_price=?, min_stock=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(name, description, category_id, supplier_id, unit_price, min_stock, req.params.id);
  res.json({ message: "Product updated" });
});

// DELETE /api/products/:id
router.delete("/:id", authenticate, (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.json({ message: "Product deleted" });
});

module.exports = router;
