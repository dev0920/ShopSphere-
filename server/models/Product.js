// ======================================================
// Product Model
// ShopSphere
// ======================================================

import mongoose from "mongoose";

const specificationSchema = new mongoose.Schema(
  {
    color: String,
    warranty: String,
    weight: String,
    dimensions: String,
    material: String
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    brand: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    subCategory: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    oldPrice: {
      type: Number,
      default: 0
    },

    images: [
      {
        type: String
      }
    ],

    stock: {
      type: Number,
      default: 0
    },

    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },

    reviewsList: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        date: { type: String, default: "Just now · Verified Buyer" },
        createdAt: { type: Date, default: Date.now },
      }
    ],

    reviews: {
      type: Number,
      default: 0
    },

    seller: {
      type: String,
      default: "ShopSphere"
    },

    specifications: {
      type: specificationSchema,
      default: {}
    },

    isFeatured: {
      type: Boolean,
      default: false
    },

    // Approval workflow
    // admin-created → approved immediately
    // vendor-created → pending until admin acts
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Optional rejection reason from admin
    rejectionReason: {
      type: String,
      default: "",
    },

    // Which admin/vendor created this product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Product", productSchema);