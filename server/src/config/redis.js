const { createClient } = require("redis");

// Create the Redis client once, at module load time.
// All other modules require() this file and share the same client instance —
// no risk of accidentally opening multiple connections.
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Surface connection errors to the console so they are never swallowed
// silently. Having an error listener also prevents Node.js from treating
// unhandled 'error' events as uncaught exceptions (which would crash
// the process).
redisClient.on("error", (err) => {
  console.error("Redis client error:", err.message);
});

redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

/**
 * Connect to Redis with graceful degradation.
 *
 * - On success  → logs "Redis connected" and returns true.
 * - On failure  → logs a clear warning and returns false.
 *                 The caller (server.js) decides whether to abort or continue.
 *
 * The function guards against calling client.connect() on an already-open
 * connection so it is safe to call multiple times during hot-reloads
 * (e.g. nodemon restarts).
 */
const connectRedis = async () => {
  // redis@4+ client tracks its own status; skip if already open.
  if (redisClient.isOpen) {
    return true;
  }

  try {
    await redisClient.connect();
    console.log("Redis connected");
    return true;
  } catch (err) {
    console.warn(
      "Redis unavailable — running without Redis features.",
      err.message
    );
    return false;
  }
};

/**
 * Returns a human-readable status string suitable for health-check responses.
 * Never exposes connection URLs, passwords, or internal error objects.
 */
const getRedisStatus = () => {
  return redisClient.isOpen ? "connected" : "disconnected";
};

module.exports = { redisClient, connectRedis, getRedisStatus };
