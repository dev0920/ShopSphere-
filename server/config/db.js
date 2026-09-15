// ===============================
// Database Connection File
// Purpose: Connect our Node.js app to MongoDB
// ===============================

import mongoose from "mongoose";

// Function to connect MongoDB
const connectDB = async () => {
    try {
        let connUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopsphere";
        if (connUri.includes("cluster0.mongodb.net")) {
            console.log("⚠️ Placeholder MONGO_URI detected! Disabling buffering so API responds immediately.");
            mongoose.set("bufferCommands", false);
            return;
        }

        await mongoose.connect(connUri, { serverSelectionTimeoutMS: 3000 });
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
        mongoose.set("bufferCommands", false);
    }
};

export default connectDB;