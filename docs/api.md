# Estoque Livre — API Reference

## Authentication

All endpoints (except `/api/auth/login` and `/api/auth/register`) require a `Bearer` token
in the `Authorization` header.

```
Authorization: Bearer <your_jwt_token>
```

Tokens are valid for **8 hours**. Obtain a token via `POST /api/auth/login`.

---

## Endpoints

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate and receive a JWT token |
| POST | `/api/auth/register` | Create a new user account |

### Products

| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | List all products (supports `?search=` and `?category_id=`) |
| GET | `/api/products/low-stock` | List products at or below minimum stock threshold |
| GET | `/api/products/:id` | Get a single product by ID |
| POST | `/api/products` | Create a product (requires `sku`, `name`) |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product (admin/manager only) |

### Categories

| Method | Path | Description |
|---|---|---|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create a category |
| DELETE | `/api/categories/:id` | Delete a category |

### Suppliers

| Method | Path | Description |
|---|---|---|
| GET | `/api/suppliers` | List all suppliers |
| POST | `/api/suppliers` | Create a supplier |
| PUT | `/api/suppliers/:id` | Update a supplier |
| DELETE | `/api/suppliers/:id` | Delete a supplier |

### Stock Movements

| Method | Path | Description |
|---|---|---|
| GET | `/api/movements` | List the last 100 movements |
| POST | `/api/movements` | Record a stock movement (`in`, `out`, or `adjustment`) |

### Reports

| Method | Path | Description |
|---|---|---|
| GET | `/api/reports/summary` | Dashboard totals (products, value, low stock, movements) |
| GET | `/api/reports/movements/csv` | Export all movements as a downloadable CSV file |

---

## Error Responses

All errors follow this format:

```json
{ "error": "Description of what went wrong" }
```

| Status | Meaning |
|---|---|
| 400 | Missing or invalid request body |
| 401 | Missing or invalid JWT token |
| 403 | Insufficient role permissions |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate SKU) |
| 500 | Internal server error |
