// =====================================================
// Auth Routes — ShopSphere
// =====================================================

import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  getProfile,
  addAddress,
  getVendorProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ────────────────────────────────────────
router.post("/register",        registerUser);
router.post("/login",           loginUser);
router.post("/google",          googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);
router.get("/vendor/:id", getVendorProfile);

// ── Authenticated (any logged-in user) ────────────
router.get("/profile", protect, getProfile);
router.post("/address", protect, addAddress);

// ── Admin only ────────────────────────────────────
router.get(    "/users",          protect, authorizeRoles("admin"), getAllUsers);
router.patch(  "/users/:id/role", protect, authorizeRoles("admin"), updateUserRole);
router.delete( "/users/:id",      protect, authorizeRoles("admin"), deleteUser);

export default router;
