# 🛍️ ShopSphere — Multi-Vendor E-Commerce & Reseller Platform

ShopSphere is a full-featured, modern **Multi-Vendor E-Commerce and Reseller Platform** built using the **MERN Stack** (MongoDB, Express, React + Vite, Node.js) with custom Vanilla CSS styling.

---

## ✨ Features & Architecture Highlights

### 🛍️ Customer Storefront & Shopping Experience
- **Interactive Home Banner & Dynamic Catalogue**:
  - Filter products by **Category**, **Sub-Category**, **Price Range**, **Rating**, and **In-Stock Availability**.
  - Dynamic sorting (*Price Low-High, High-Low, Highest Rated, Newest*).
- **Product Details & Stock Transparency**:
  - Real-time **Available Piece Counter** (e.g. `📦 50 Pieces Available` / `Only X left`).
  - Interactive **Vendor & Shop Badge Card** linking directly to the vendor's storefront.
- **Cart & Smooth Checkout**:
  - Responsive shopping cart with real-time total calculation.
  - Delivery address form with support for **Cash on Delivery (COD)** and **Online Payments**.

### 🏪 Vendor Storefront & Disbursal Portal
- **Dedicated Vendor Dashboard (`/vendor-dashboard`)**:
  - **Financial Breakdown**: Real-time **Gross Customer Sales** vs **95% Net Vendor Profit** (5% Admin Fee).
  - **Product Submission & Approval Workflow**: Vendors submit products with status `pending` until Super Admin approves.
  - **Catalog Management**: View live, pending, and rejected product statuses.
- **Public Vendor Storefront (`/vendor/:id`)**:
  - Dedicated storefront page displaying vendor store avatar, verified badge, rating, and all live items.
  - In-store search bar to query products within that specific vendor's catalog.

### 🛡️ Super Admin Control Center (`/admin-dashboard`)
- **Product Approval Workflow**: Review pending vendor product submissions with 1-click `Approve` or `Reject` actions.
- **Platform Analytics**: Total revenue, platform commissions, active vendor counts, total users, and order dispatches.
- **Role Governance**: Manage user accounts and toggle user/vendor/admin roles.

### 🤝 Reseller Earnings Hub (`/reseller-hub`)
- **Reseller Margin Calculator**: Calculate custom resale pricing and profit margins.
- **1-Click Social Sharing**: Generate custom WhatsApp links with product descriptions, prices, and direct links.

---

## 🔑 Demo Access Credentials

| Role | Email / User ID | Password | Portal URL |
| :--- | :--- | :--- | :--- |
| **🛡️ Super Admin** | `admin@shopsphere.com` | `Admin@123` | `/admin-dashboard` |
| **🏪 Vendor / Seller** | `vendor@shopsphere.com` | `Vendor@123` | `/vendor-dashboard` |
| **🛍️ Standard Shopper** | `user@shopsphere.com` | `User@123` | `/login` |

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance running on `mongodb://localhost:27017` or MongoDB Atlas URI)

### 2. Backend Server Setup
```bash
cd server
npm install

# (Optional) Seed Admin & Vendor accounts
node createAdmin.js
node createVendor.js

# Start backend server (Runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Client Setup
```bash
cd client
npm install

# Start Vite dev server (Runs on http://localhost:5173)
npm run dev
```

---

## 📑 API Endpoint Documentation

### 🔑 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new shopper or vendor account
- `POST /api/auth/login` — Login user/admin/vendor and receive JWT token
- `GET /api/auth/profile` — Fetch logged-in user profile (`protect` middleware)
- `GET /api/auth/vendor/:id` — Public endpoint to fetch vendor store profile and product statistics

### 📦 Product Management (`/api/products`)
- `GET /api/products` — Fetch approved live products (supports `category`, `search`, `vendorId`, `status`)
- `GET /api/products/:id` — Fetch single product details populated with vendor creator info
- `POST /api/products` — Create product (`admin` -> `approved` immediately; `vendor` -> `pending` review)
- `PATCH /api/products/:id/status` — Admin 1-click product approval/rejection (`status: "approved" | "rejected"`)
- `DELETE /api/products/:id` — Delete product item

### 📑 Order Processing (`/api/orders`)
- `POST /api/orders` — Place customer order
- `GET /api/orders/my-orders` — Get order history for logged-in user
- `GET /api/orders/vendor-orders` — Fetch vendor orders and sales dispatches

---

## 💻 Tech Stack
- **Frontend**: React 18, Vite, React Router DOM v6, Custom Vanilla CSS
- **Backend**: Node.js, Express.js, MongoDB, Mongoose ORM, JWT, BcryptJS
- **Design Systems**: Glassmorphism, HSL tailwind-free design system, smooth micro-animations

---

*ShopSphere — Empowering E-Commerce Sellers & Resellers Platform.*
