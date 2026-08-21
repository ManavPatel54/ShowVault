require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Step 1 — MongoDB (source of truth for all booking data).
    // Failure here is fatal; there is nothing meaningful to serve without it.
    await connectDB();

    // Step 2 — Redis (optional caching / rate-limiting layer).
    // Failure is non-fatal: the application continues with degraded features
    // and logs a clear warning so the issue is never silently hidden.
    await connectRedis();

    // Step 3 — Express HTTP server.
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
