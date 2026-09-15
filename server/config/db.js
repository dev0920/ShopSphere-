// ===============================
// Database Connection File
// Purpose: Connect our Node.js app to MongoDB
// ===============================

import mongoose from "mongoose";

// Function to connect MongoDB
const connectDB = async () => {
    try {
        const connUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopsphere";
        await mongoose.connect(connUri);

        console.log("✅ MongoDB Connected Successfully");

        const Product = (await import("../models/Product.js")).default;
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log("🌱 Database is empty! Auto-seeding initial products & users...");
            const { runAutoSeed } = await import("../seeder.js");
            await runAutoSeed();
        }
    } catch (error) {
        console.log("❌ MongoDB Connection Warning:", error.message);
        // Do not crash server process on cloud environment so Render health check succeeds
        if (!process.env.PORT && process.env.NODE_ENV !== "production") {
            process.exit(1);
        }
    }
};

export default connectDB;