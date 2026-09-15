import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Prevent server process crashes from background async errors
process.on("uncaughtException", (err) => {
  console.error("⚠️ Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("⚠️ Unhandled Promise Rejection:", reason);
});

// Connect MongoDB
connectDB();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT} (http://localhost:${PORT})`);
});