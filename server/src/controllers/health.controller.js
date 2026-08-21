const mongoose = require("mongoose");
const { getRedisStatus } = require("../config/redis");

const healthCheck = (req, res) => {
  // mongoose.connection.readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const mongoState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    success: true,
    message: "Event Booking Engine API is running",
    services: {
      mongodb: mongoState,
      redis: getRedisStatus(),
    },
  });
};

module.exports = { healthCheck };
