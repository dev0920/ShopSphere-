// =====================================================
// Product Routes — ShopSphere
// =====================================================

import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  approveProduct,
  rejectProduct,
  deleteProduct,
  addReviewToProduct,
} from "../controllers/productController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Safe upload wrapper to catch upload errors gracefully
const handleUpload = (fieldName, maxCount) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        console.error("Upload Warning:", err.message || err);
      }
      next();
    });
  };
};

// ── Public ────────────────────────────────────────
router.get("/", getProducts);
router.get("/:id", getProductById);

// ── Authenticated Users: Submit Review ────────────
router.post("/:id/reviews", protect, addReviewToProduct);

// ── Vendor + Admin: create ────────────────────────
router.post(
  "/",
  protect,
  authorizeRoles("admin", "vendor"),
  handleUpload("images", 5),
  createProduct
);

// ── Vendor + Admin: update ────────────────────────
router.patch(
  "/:id",
  protect,
  authorizeRoles("admin", "vendor"),
  handleUpload("images", 5),
  updateProduct
);

// ── Admin only: approve / reject / delete ─────────
router.patch("/:id/approve", protect, authorizeRoles("admin"), approveProduct);
router.patch("/:id/reject",  protect, authorizeRoles("admin"), rejectProduct);
router.delete("/:id",        protect, authorizeRoles("admin"), deleteProduct);

export default router;
