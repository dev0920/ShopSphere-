import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../server/.env") });

import Product from "../../server/models/Product.js";

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopsphere";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const products = await Product.find({});
    console.log(`Total products in database: ${products.length}`);

    let updatedCount = 0;
    for (let i = 0; i < products.length; i++) {
      // Set oldPrice to 0 for odd-indexed products so NOT all products show discounts
      if (i % 2 === 1) {
        products[i].oldPrice = 0;
        await products[i].save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} products to have NO discount (oldPrice = 0).`);
    process.exit(0);
  } catch (err) {
    console.error("Error fixing product discounts:", err);
    process.exit(1);
  }
};

run();
