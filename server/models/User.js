// =======================================
// User Model
// Purpose: Defines how user data is stored
// =======================================

import mongoose from "mongoose";

// Create User Schema
const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // User's email (must be unique)
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Encrypted password (we'll hash it later)
    password: {
      type: String,
      required: true,
    },

    // Role of the user
    role: {
      type: String,
      enum: ["user", "vendor", "admin", "delivery"],
      default: "user",
    },

    // Optional profile image
    profileImage: {
      type: String,
      default: "",
    },

    // Google OAuth integration fields
    googleId: {
      type: String,
      default: "",
    },

    isGoogleUser: {
      type: Boolean,
      default: false,
    },

    // Password reset fields
    resetPasswordOtp: {
      type: String,
      default: "",
    },

    resetPasswordExpire: {
      type: Date,
      default: null,
    },

    // User phone number
    phone: {
      type: String,
      default: "",
    },

    // Saved delivery addresses
    addresses: [
      {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  {
    // Automatically adds createdAt and updatedAt
    timestamps: true,
  }
);

// Create Model
const User = mongoose.model("User", userSchema);

// Export Model
export default User;