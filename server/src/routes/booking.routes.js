const express = require('express');
const { createBooking, getBooking, getMyBookings } = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Create a booking from held seats
router.post('/', protect, createBooking);

// List all bookings for the authenticated user
router.get('/', protect, getMyBookings);

// Get a single booking (ownership-checked)
router.get('/:id', protect, getBooking);

module.exports = router;
