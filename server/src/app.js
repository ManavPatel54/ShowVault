const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const venueRoutes = require("./routes/venue.routes");
const screenRoutes = require("./routes/screen.routes");
const seatRoutes = require("./routes/seat.routes");
const eventRoutes = require("./routes/event.routes");
const showRoutes = require("./routes/show.routes");
const showSeatRoutes = require("./routes/showSeat.routes");
const bookingRoutes = require("./routes/booking.routes");
const paymentRoutes = require("./routes/payment.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/screens", screenRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/shows", showRoutes);
app.use("/api", showSeatRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

module.exports = app;
