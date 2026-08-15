const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Event Booking Engine API is running",
  });
};

module.exports = { healthCheck };
