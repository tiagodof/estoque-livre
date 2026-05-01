/**
 * Request logger middleware.
 * Logs HTTP method, path, status code, and response time to stdout.
 * Format: [INFO] GET /api/products 200 — 12ms
 */
function logger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? "ERROR" : "INFO";
    console.log(
      `[${level}] ${req.method} ${req.path} ${res.statusCode} — ${duration}ms`
    );
  });
  next();
}

module.exports = { logger };
