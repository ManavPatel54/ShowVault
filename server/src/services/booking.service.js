const mongoose = require('mongoose');
const Booking = require('../models/booking.model');
const ShowSeat = require('../models/showSeat.model');
const Show = require('../models/show.model');

// ---------------------------------------------------------------------------
// createBooking
//
// Validates seat ownership/state entirely on the backend.
// The client only provides showId and showSeatIds — never price or status.
// ---------------------------------------------------------------------------

const createBooking = async (userId, showId, showSeatIds) => {
  // 1. Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('Invalid user ID');
    err.statusCode = 400;
    throw err;
  }
  if (!mongoose.Types.ObjectId.isValid(showId)) {
    const err = new Error('Invalid show ID');
    err.statusCode = 400;
    throw err;
  }
  if (!Array.isArray(showSeatIds) || showSeatIds.length === 0) {
    const err = new Error('showSeatIds must be a non-empty array');
    err.statusCode = 400;
    throw err;
  }
  for (const id of showSeatIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error(`Invalid ShowSeat ID: ${id}`);
      err.statusCode = 400;
      throw err;
    }
  }

  // 2. Prevent duplicate seat IDs in the request
  const uniqueSeatIds = [...new Set(showSeatIds.map(String))];
  if (uniqueSeatIds.length !== showSeatIds.length) {
    const err = new Error('Duplicate ShowSeat IDs are not allowed');
    err.statusCode = 400;
    throw err;
  }

  // 3. Verify Show exists and is SCHEDULED (not cancelled/completed)
  const show = await Show.findById(showId);
  if (!show) {
    const err = new Error('Show not found');
    err.statusCode = 404;
    throw err;
  }
  if (show.status !== 'SCHEDULED') {
    const err = new Error(`Show is not available for booking (status: ${show.status})`);
    err.statusCode = 409;
    throw err;
  }

  // 4. Load all requested ShowSeats
  const showSeats = await ShowSeat.find({ _id: { $in: uniqueSeatIds } });

  if (showSeats.length !== uniqueSeatIds.length) {
    const err = new Error('One or more ShowSeat IDs were not found');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date();

  // 5. Validate each seat: belongs to show, status=HELD, held by this user, not expired
  for (const ss of showSeats) {
    // Belongs to the requested show
    if (ss.show.toString() !== showId.toString()) {
      const err = new Error(`ShowSeat ${ss._id} does not belong to the requested show`);
      err.statusCode = 409;
      throw err;
    }

    // Must be HELD
    if (ss.status !== 'HELD') {
      const err = new Error(`Seat is not held (current status: ${ss.status})`);
      err.statusCode = 409;
      throw err;
    }

    // Must be held by this user
    if (!ss.heldBy || ss.heldBy.toString() !== userId.toString()) {
      const err = new Error('One or more seats are not held by you');
      err.statusCode = 403;
      throw err;
    }

    // Hold must not have expired
    if (!ss.holdExpiresAt || ss.holdExpiresAt <= now) {
      const err = new Error('One or more seat holds have expired');
      err.statusCode = 409;
      throw err;
    }
  }

  // 6. Calculate totalAmount from DB prices (never trust client-submitted amount)
  const totalAmount = showSeats.reduce((sum, ss) => sum + ss.price, 0);

  // 7. Set expiresAt to the earliest holdExpiresAt among selected seats
  //    so that the payment window matches the tightest existing hold
  const expiresAt = showSeats.reduce((earliest, ss) => {
    return ss.holdExpiresAt < earliest ? ss.holdExpiresAt : earliest;
  }, showSeats[0].holdExpiresAt);

  // 8. Create the booking
  const booking = await Booking.create({
    user: userId,
    show: showId,
    showSeats: uniqueSeatIds,
    totalAmount,
    status: 'PAYMENT_PENDING',
    expiresAt
  });

  return booking;
};

// ---------------------------------------------------------------------------
// getBookingById
//
// Ownership-checked fetch. Populates show → event + screen chain, and seats.
// ---------------------------------------------------------------------------

const getBookingById = async (bookingId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    const err = new Error('Invalid booking ID');
    err.statusCode = 400;
    throw err;
  }

  const booking = await Booking.findById(bookingId)
    .populate({
      path: 'show',
      select: 'startTime endTime basePrice status',
      populate: [
        { path: 'event', select: 'title category language durationMinutes' },
        { path: 'screen', select: 'name screenNumber' }
      ]
    })
    .populate({
      path: 'showSeats',
      select: 'price status seat',
      populate: { path: 'seat', select: 'rowLabel seatNumber seatType' }
    });

  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  // Ownership check
  if (booking.user.toString() !== userId.toString()) {
    const err = new Error('Access denied: this booking does not belong to you');
    err.statusCode = 403;
    throw err;
  }

  return booking;
};

// ---------------------------------------------------------------------------
// getUserBookings
//
// Returns all bookings belonging to the authenticated user, newest first.
// ---------------------------------------------------------------------------

const getUserBookings = async (userId) => {
  return await Booking.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'show',
      select: 'startTime endTime status',
      populate: [
        { path: 'event', select: 'title category' },
        { path: 'screen', select: 'name' }
      ]
    })
    .populate({
      path: 'showSeats',
      select: 'price seat',
      populate: { path: 'seat', select: 'rowLabel seatNumber seatType' }
    });
};

module.exports = { createBooking, getBookingById, getUserBookings };
