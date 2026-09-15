import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to ShopSphere API 🚀",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

export default app;