import mongoose from "mongoose";

// Schema for each product inside an order
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  quantity: {
    type: Number,
    required: true,
    min: 1
  },

  // Product image
  image: {
    type: String,
    default: ""
  },

  // Product icon (fallback)
  icon: {
    type: String,
    default: "🛍️"
  },

  // Seller & Vendor information for accurate profit calculation
  seller: {
    type: String,
    default: ""
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

// Main Order Schema
const orderSchema = new mongoose.Schema(
  {
    // Logged-in user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Ordered products
    items: {
      type: [orderItemSchema],
      required: true
    },

    // Delivery address
    shippingAddress: {
      fullName: {
        type: String,
        required: true
      },

      phone: {
        type: String,
        required: true
      },

      address: {
        type: String,
        required: true
      },

      city: {
        type: String,
        required: true
      },

      state: {
        type: String,
        required: true
      },

      pincode: {
        type: String,
        required: true
      }
    },

    // Total order amount
    totalAmount: {
      type: Number,
      required: true
    },

    // Current order status
    orderStatus: {
      type: String,
      enum: [
        "Order Placed",
        "Processing",
        "Dispatched",
        "Out for Delivery",
        "Shipped",
        "Delivered",
        "Cancelled"
      ],
      default: "Order Placed"
    },

    // Online Payment details
    paymentMethod: {
      type: String,
      enum: ["UPI", "CARD", "COD"],
      default: "COD"
    },

    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING", "FAILED", "REFUNDED", "REFUND_INITIATED"],
      default: "PENDING"
    },

    transactionId: {
      type: String,
      default: ""
    },

    cancellationReason: {
      type: String,
      default: ""
    },

    paymentDetails: {
      upiId: { type: String, default: "" },
      utrNumber: { type: String, default: "" },
      cardLast4: { type: String, default: "" },
      cardBrand: { type: String, default: "" },
      bankName: { type: String, default: "" },
      refundId: { type: String, default: "" },
      refundAmount: { type: Number, default: 0 },
      refundStatus: { type: String, default: "" },
      refundDate: { type: Date }
    },

    // Delivery Partner & Handoff OTP Details
    deliveryBoyName: {
      type: String,
      default: ""
    },

    deliveryBoyPhone: {
      type: String,
      default: ""
    },

    deliveryOtp: {
      type: String,
      default: ""
    },

    dispatchedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);
  
// Export Order model
const Order = mongoose.model("Order", orderSchema);

export default Order;