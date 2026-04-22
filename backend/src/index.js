const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productsRouter   = require("./routes/products");
const suppliersRouter  = require("./routes/suppliers");
const movementsRouter  = require("./routes/movements");
const authRouter       = require("./routes/auth");
const reportsRouter    = require("./routes/reports");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use("/api/auth",      authRouter);
app.use("/api/products",  productsRouter);
app.use("/api/suppliers", suppliersRouter);
app.use("/api/movements", movementsRouter);
app.use("/api/reports",   reportsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "estoque-livre" });
});

app.listen(PORT, () => {
  console.log(`Estoque Livre API running on http://localhost:${PORT}`);
});

module.exports = app;
