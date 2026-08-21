const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');
const ShowSeat = require('../models/showSeat.model');

// ---------------------------------------------------------------------------
// Allowed simulated result values — server enforces the enum.
// ---------------------------------------------------------------------------
const VALID_RESULTS = ['SUCCESS', 'FAILED'];

// ---------------------------------------------------------------------------
// processPayment
//
// Handles idempotency, ownership validation, expiry checks, and a full
// MongoDB transaction for either the success or failure path.
//
// Parameters:
//   userId         — from req.user.userId (trusted JWT)
//   bookingId      — from req.body.bookingId
//   idempotencyKey — from Idempotency-Key header
//   result         — 'SUCCESS' | 'FAILED' (from req.body.result)
// ---------------------------------------------------------------------------

const processPayment = async (userId, bookingId, idempotencyKey, result) => {
  // ── 1. Input validation ──────────────────────────────────────────────────
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    const err = new Error('Invalid booking ID');
    err.statusCode = 400;
    throw err;
  }
  if (!idempotencyKey || typeof idempotencyKey !== 'string' || !idempotencyKey.trim()) {
    const err = new Error('Idempotency-Key header is required');
    err.statusCode = 400;
    throw err;
  }
  if (!VALID_RESULTS.includes(result)) {
    const err = new Error(`Invalid result. Must be one of: ${VALID_RESULTS.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const trimmedKey = idempotencyKey.trim();

  // ── 2. Load and validate the booking ────────────────────────────────────
  const booking = await Booking.findById(bookingId);
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

  // ── 3. Idempotency check — return existing payment if key already used ──
  const existingPayment = await Payment.findOne({
    booking: bookingId,
    idempotencyKey: trimmedKey
  }).populate('booking');

  if (existingPayment) {
    // Safe idempotent return — same result, no new operation
    return { payment: existingPayment, booking: existingPayment.booking, idempotent: true };
  }

  // ── 4. Guard: booking must be in a payable state ─────────────────────────
  if (booking.status === 'CONFIRMED') {
    const err = new Error('This booking is already confirmed. Cannot process another payment.');
    err.statusCode = 409;
    throw err;
  }
  if (booking.status === 'FAILED' || booking.status === 'CANCELLED') {
    const err = new Error(`This booking is no longer payable (status: ${booking.status})`);
    err.statusCode = 409;
    throw err;
  }
  if (booking.status !== 'PAYMENT_PENDING') {
    const err = new Error(`Unexpected booking status: ${booking.status}`);
    err.statusCode = 409;
    throw err;
  }

  // ── 5. Expiry check ───────────────────────────────────────────────────────
  const now = new Date();
  if (booking.expiresAt && booking.expiresAt <= now) {
    const err = new Error('Booking has expired. The seat holds have lapsed.');
    err.statusCode = 409;
    throw err;
  }

  // ── 6. Branch on simulated result ────────────────────────────────────────
  if (result === 'SUCCESS') {
    return await processSuccess(userId, booking, trimmedKey);
  } else {
    return await processFailure(userId, booking, trimmedKey);
  }
};

// ---------------------------------------------------------------------------
// processSuccess — MongoDB transaction
//
// Within a single atomic transaction:
//   1. Re-verify booking state
//   2. Re-verify all ShowSeats are still HELD by this user and not expired
//   3. Update ShowSeats → BOOKED
//   4. Update Booking → CONFIRMED
//   5. Create Payment → SUCCESS with generated transactionId
// ---------------------------------------------------------------------------

const processSuccess = async (userId, booking, idempotencyKey) => {
  const session = await mongoose.startSession();
  let payment, updatedBooking;

  try {
    await session.withTransaction(async () => {
      const now = new Date();

      // Re-fetch booking inside transaction for consistency
      const txBooking = await Booking.findById(booking._id).session(session);
      if (!txBooking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
      if (txBooking.user.toString() !== userId.toString()) {
        throw Object.assign(new Error('Booking ownership mismatch'), { statusCode: 403 });
      }
      if (txBooking.status !== 'PAYMENT_PENDING') {
        throw Object.assign(
          new Error(`Booking is no longer payable (status: ${txBooking.status})`),
          { statusCode: 409 }
        );
      }
      if (txBooking.expiresAt && txBooking.expiresAt <= now) {
        throw Object.assign(new Error('Booking expired'), { statusCode: 409 });
      }

      // Re-fetch all ShowSeats inside transaction
      const showSeats = await ShowSeat.find({
        _id: { $in: txBooking.showSeats }
      }).session(session);

      if (showSeats.length !== txBooking.showSeats.length) {
        throw Object.assign(new Error('One or more ShowSeats not found'), { statusCode: 404 });
      }

      // Validate every seat is still HELD by this user and not expired
      for (const ss of showSeats) {
        if (ss.status !== 'HELD') {
          throw Object.assign(
            new Error(`Seat is no longer held (status: ${ss.status})`),
            { statusCode: 409 }
          );
        }
        if (!ss.heldBy || ss.heldBy.toString() !== userId.toString()) {
          throw Object.assign(
            new Error('Seat hold ownership mismatch'),
            { statusCode: 409 }
          );
        }
        if (!ss.holdExpiresAt || ss.holdExpiresAt <= now) {
          throw Object.assign(new Error('Seat hold has expired'), { statusCode: 409 });
        }
      }

      // Update all ShowSeats → BOOKED atomically
      await ShowSeat.updateMany(
        { _id: { $in: txBooking.showSeats } },
        { $set: { status: 'BOOKED', heldBy: null, holdExpiresAt: null } },
        { session }
      );

      // Update Booking → CONFIRMED
      updatedBooking = await Booking.findByIdAndUpdate(
        txBooking._id,
        { $set: { status: 'CONFIRMED' } },
        { new: true, session }
      );

      // Create Payment → SUCCESS
      const transactionId = `TXN-${randomUUID().toUpperCase()}`;
      [payment] = await Payment.create(
        [
          {
            booking: txBooking._id,
            amount: txBooking.totalAmount,
            status: 'SUCCESS',
            transactionId,
            idempotencyKey
          }
        ],
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  return { payment, booking: updatedBooking, idempotent: false };
};

// ---------------------------------------------------------------------------
// processFailure — MongoDB transaction
//
// Within a single atomic transaction:
//   1. Re-verify booking state
//   2. Release all HELD ShowSeats → AVAILABLE
//   3. Update Booking → FAILED
//   4. Create Payment → FAILED
// ---------------------------------------------------------------------------

const processFailure = async (userId, booking, idempotencyKey) => {
  const session = await mongoose.startSession();
  let payment, updatedBooking;

  try {
    await session.withTransaction(async () => {
      // Re-fetch booking inside transaction
      const txBooking = await Booking.findById(booking._id).session(session);
      if (!txBooking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
      if (txBooking.user.toString() !== userId.toString()) {
        throw Object.assign(new Error('Booking ownership mismatch'), { statusCode: 403 });
      }
      if (txBooking.status !== 'PAYMENT_PENDING') {
        throw Object.assign(
          new Error(`Booking is no longer payable (status: ${txBooking.status})`),
          { statusCode: 409 }
        );
      }

      // Release all HELD seats → AVAILABLE
      // We release seats regardless of expiry to clean up any still-held seats
      await ShowSeat.updateMany(
        {
          _id: { $in: txBooking.showSeats },
          status: 'HELD',
          heldBy: userId
        },
        { $set: { status: 'AVAILABLE', heldBy: null, holdExpiresAt: null } },
        { session }
      );

      // Update Booking → FAILED
      updatedBooking = await Booking.findByIdAndUpdate(
        txBooking._id,
        { $set: { status: 'FAILED' } },
        { new: true, session }
      );

      // Create Payment → FAILED
      [payment] = await Payment.create(
        [
          {
            booking: txBooking._id,
            amount: txBooking.totalAmount,
            status: 'FAILED',
            transactionId: null,
            idempotencyKey
          }
        ],
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  return { payment, booking: updatedBooking, idempotent: false };
};

module.exports = { processPayment };
