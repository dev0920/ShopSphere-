import express from "express";
import {
  createOrder,
  verifyUpiPaymentStatus,
  getMyOrders,
  getVendorOrders,
  dispatchOrder,
  getDeliveryOrders,
  verifyAndDeliverOrder,
  cancelOrder
} from "../controllers/orderController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Verify UPI payment status with bank gateway
router.post("/verify-upi-status", protect, verifyUpiPaymentStatus);

// Create a new order
router.post("/", protect, createOrder);

// Get logged-in user's orders
router.get("/my-orders", protect, getMyOrders);

// Get vendor / admin orders
router.get("/vendor-orders", protect, authorizeRoles("vendor", "admin"), getVendorOrders);

// Get delivery executive assigned orders (Public / Partner Portal)
router.get("/delivery-orders", getDeliveryOrders);

// Dispatch order & assign delivery executive (Vendor / Admin)
router.put("/:id/dispatch", protect, authorizeRoles("vendor", "admin"), dispatchOrder);

// Verify 4-digit Delivery PIN & complete order delivery (Delivery Partner)
router.put("/:id/deliver", verifyAndDeliverOrder);

// Cancel Order (Customer / Authorized Role)
router.put("/:id/cancel", protect, cancelOrder);

export default router;