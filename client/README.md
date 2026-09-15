# 🛍️ ShopSphere — Multi-Vendor E-Commerce & Reseller Platform

Welcome to **ShopSphere**, a modern, full-featured **Multi-Vendor E-Commerce and Reseller Platform** built with **React, Vite, Node.js, Express, and MongoDB** with custom Vanilla CSS styling.

---

## 🚀 Recent Feature Updates & Enhancements

### 1. 🏪 Clickable Vendor Details & Public Vendor Storefront (`/vendor/:id`)
- **Clickable Vendor Store Card**: On the product page (`ProductDetails.jsx`), clicking the vendor name or **"Visit Vendor Store →"** opens that seller's dedicated storefront page.
- **Public Vendor Storefront (`VendorStore.jsx`)**:
  - Displays vendor avatar 🏪, verified badge `✅ Verified Seller`, rating `⭐ 4.9`, and live item counts.
  - In-store search bar to filter products specifically from that vendor.

### 2. 📦 Exact Available Piece Counter & Stock Transparency
- **Real-Time Piece Count Badges**:
  - **Product Page**: Displays **`📦 50 Pieces Available`** or `❌ 0 Pieces (Out of Stock)`.
  - **Product Cards**: Displays **`📦 50 Pcs Left`** badges on catalogue and homepage cards.
- **In-Stock Sidebar Filter**: Shoppers can toggle the **`⚡ In Stock Only`** checkbox filter on the Catalogue page (`/catalogue`).

### 3. 💵 Vendor Profit Disbursal & Dashboard (`/vendor-dashboard`)
- **Financial Earnings Breakdown**: Calculates **Gross Customer Sales** vs **95% Net Vendor Profit** (5% Admin Fee).
- **Product Approval Workflow**: Products submitted by vendors default to `status: "pending"` with a pending approval notification banner until Super Admin approves.

### 4. 🛡️ Super Admin Control Center (`/admin-dashboard`)
- **1-Click Approvals**: Approve (`status: "approved"`) or Reject (`status: "rejected"`) vendor product submissions.
- **Platform Analytics**: Manage users, roles, order statuses, and platform revenue.

### 5. 🤝 Reseller Earnings Hub (`/reseller-hub`)
- **Reseller Margin Calculator**: Estimate custom resale pricing and profit earnings.
- **WhatsApp 1-Click Sharing**: Share product photos, prices, and links on social media.

---

## 🔑 Demo Login Credentials

| Role | Email / User ID | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **🛡️ Super Admin** | `admin@shopsphere.com` | `Admin@123` | `/admin-dashboard` |
| **🏪 Vendor / Seller** | `vendor@shopsphere.com` | `Vendor@123` | `/vendor-dashboard` |
| **🛍️ Standard Customer** | `user@shopsphere.com` | `User@123` | `/login` |

---

## 🛠️ Local Development & Setup Commands

### Frontend Client Setup (`client`)
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite Development Server (Runs on http://localhost:5173)
npm run dev

# Build for Production
npm run build
```

### Backend Server Setup (`server`)
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# (Optional) Seed Admin & Vendor Accounts
node createAdmin.js
node createVendor.js

# Start Express API Server (Runs on http://localhost:5000)
npm run dev
```

---

## 📡 API Endpoint Overview

- `POST /api/auth/register` — Account registration
- `POST /api/auth/login` — Login user/admin/vendor
- `GET /api/auth/vendor/:id` — Public vendor profile and stats
- `GET /api/products` — Get live approved products (supports `vendorId`, `category`, `search`)
- `POST /api/products` — Create product submission
- `PATCH /api/products/:id/status` — Admin 1-click product approval
- `POST /api/orders` — Checkout order submission
- `GET /api/orders/my-orders` — User order history
- `GET /api/orders/vendor-orders` — Vendor order dispatches

---

*ShopSphere — Built with React & Node.js*
