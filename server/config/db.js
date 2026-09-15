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
    } catch (error) {
        console.log("❌ MongoDB Connection Failed");
        console.log(error.message);

        // Stop the server if database connection fails
        process.exit(1);
    }
};

export default connectDB;