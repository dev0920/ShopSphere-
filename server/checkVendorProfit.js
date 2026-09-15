import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";

async function check() {
  await mongoose.connect("mongodb://127.0.0.1:27017/shopsphere");
  console.log("Connected to DB");

  const vendor1 = await User.findOne({ email: "vendor1@kashisilk.com" });
  console.log("\n--- VENDOR 1 USER ---");
  console.log(vendor1 ? { id: vendor1._id, name: vendor1.name, email: vendor1.email } : "NOT FOUND");

  if (!vendor1) {
    process.exit(0);
  }

  const vProducts = await Product.find({ createdBy: vendor1._id });
  console.log("\n--- VENDOR 1 PRODUCTS COUNT:", vProducts.length, "---");
  vProducts.forEach(p => console.log(" - Product ID:", p._id.toString(), "| Name:", p.name, "| Price: ₹" + p.price, "| Status:", p.status));

  const allProducts = await Product.find();
  console.log("\n--- ALL PRODUCTS COUNT IN DB:", allProducts.length, "---");

  const orders = await Order.find();
  console.log("\n--- ORDERS COUNT IN DB:", orders.length, "---");

  let totalVendorSales = 0;
  let matchedItemsCount = 0;

  orders.forEach((o, i) => {
    console.log(`\nOrder #${i+1} [ID: ${o._id}] PaymentStatus: ${o.paymentStatus} TotalAmount: ₹${o.totalAmount}`);
    o.items.forEach(it => {
      const itProdId = it.product ? (it.product._id ? it.product._id.toString() : it.product.toString()) : "";
      const itCreatedBy = it.createdBy ? (it.createdBy._id ? it.createdBy._id.toString() : it.createdBy.toString()) : "";
      const itSeller = (it.seller || "").toLowerCase();

      const isMatch = (itCreatedBy && itCreatedBy === vendor1._id.toString()) ||
        vProducts.some(p => p._id.toString() === itProdId) ||
        itSeller.includes("kashi");

      console.log("  Item:", {
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        product: itProdId,
        createdBy: itCreatedBy,
        seller: it.seller,
        IS_MATCH: isMatch
      });

      if (isMatch) {
        matchedItemsCount++;
        totalVendorSales += (Number(it.price) * Number(it.quantity));
        console.log("    ✅ MATCHED VENDOR ITEM! Subtotal: ₹" + (it.price * it.quantity));
      }
    });
  });

  console.log("\n======================================================");
  console.log("MATCHED VENDOR 1 ITEMS COUNT:", matchedItemsCount);
  console.log("TOTAL CALCULATED SALES FOR VENDOR 1: ₹" + totalVendorSales);
  console.log("TOTAL 95% NET PROFIT FOR VENDOR 1: ₹" + (totalVendorSales * 0.95));
  console.log("======================================================\n");

  process.exit(0);
}

check();
