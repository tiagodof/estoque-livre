/**
 * Simple request body validation middleware factory.
 * Usage: router.post("/", validate(["name", "sku"]), handler)
 */
function validate(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter((f) => !req.body[f]);
    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }
    next();
  };
}

module.exports = { validate };
