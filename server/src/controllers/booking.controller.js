const bookingService = require('../services/booking.service');
const sanitizeError = require('../utils/sanitizeError');

/**
 * POST /api/bookings
 * Create a booking from held seats. User identity from JWT only.
 */
const createBooking = async (req, res) => {
  try {
    const { showId, showSeatIds } = req.body;
    const userId = req.user.userId;

    const booking = await bookingService.createBooking(userId, showId, showSeatIds);

    return res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: sanitizeError(error)
    });
  }
};

/**
 * GET /api/bookings/:id
 * Fetch a single booking. Returns 403 if it belongs to another user.
 */
const getBooking = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user.userId);
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: sanitizeError(error)
    });
  }
};

/**
 * GET /api/bookings
 * List all bookings belonging to the authenticated user.
 */
const getMyBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user.userId);
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: sanitizeError(error)
    });
  }
};

module.exports = { createBooking, getBooking, getMyBookings };
