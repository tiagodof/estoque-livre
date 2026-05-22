# 📦 Estoque Livre

> **Free and open-source inventory management webapp** for small businesses and NGOs, built with React, Node.js and SQLite. No subscription. No hidden fees. Just works.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg)](https://nodejs.org)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57.svg)](https://sqlite.org)

---

## 🎯 What is Estoque Livre?

Estoque Livre is a lightweight, self-hostable inventory management system designed for small shops, community organisations, and NGOs that cannot afford expensive SaaS solutions.

It covers the full inventory lifecycle: from registering products and suppliers to tracking stock movements, generating low-stock alerts, and exporting reports.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Product Management** | Add, edit, and categorise products with SKU, price, and description |
| **Stock Control** | Record incoming and outgoing stock movements with timestamps |
| **Low Stock Alerts** | Configurable thresholds with dashboard notifications |
| **Supplier Management** | Track suppliers and link them to products |
| **Reports** | Export stock summaries and movement history as CSV or PDF |
| **Multi-user** | Role-based access: Admin, Manager, and Viewer |
| **Offline-first** | Works without internet; syncs when connection is restored |

---

## 🏗️ Architecture

```
estoque-livre/
├── frontend/               # React + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── store/          # Zustand state management
├── backend/                # Node.js + Express
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/         # SQLite via better-sqlite3
│   │   └── middleware/
├── database/
│   └── schema.sql
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
git clone https://github.com/tiagodof/estoque-livre.git
cd estoque-livre

# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Default credentials

```
Username: admin
Password: admin123
```

Change these immediately after first login.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push and open a Pull Request

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
