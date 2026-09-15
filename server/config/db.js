// ===============================
// Database Connection File
// Purpose: Connect our Node.js app to MongoDB
// ===============================

import mongoose from "mongoose";

// Function to connect MongoDB
const connectDB = async () => {
    try {
        // Connect to local MongoDB database
        // If "shopsphere" doesn't exist, MongoDB will create it automatically
        await mongoose.connect("mongodb://127.0.0.1:27017/shopsphere");

        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.log("❌ MongoDB Connection Failed");
        console.log(error.message);

        // Stop the server if database connection fails
        process.exit(1);
    }
};

export default connectDB;