const mongoose = require('mongoose');

/**
 * Booking model — represents a user's intent to purchase tickets for a show.
 *
 * Design notes:
 * - References ShowSeat (not physical Seat) because ShowSeat carries the
 *   show-specific price and availability state.
 * - totalAmount is calculated server-side from ShowSeat.price values.
 * - expiresAt mirrors the earliest holdExpiresAt of the requested seats,
 *   so payment requests after expiry are cleanly rejected with 409.
 *
 * Status transitions:
 *   PENDING        → initial creation (not currently used in flow)
 *   PAYMENT_PENDING → booking created, waiting for payment
 *   CONFIRMED      → payment succeeded (set inside MongoDB transaction)
 *   FAILED         → payment failed (seats released)
 *   CANCELLED      → reserved for future user/admin cancellation
 */
const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show reference is required']
    },
    showSeats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShowSeat',
        required: true
      }
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED'],
      default: 'PAYMENT_PENDING',
      required: true
    },
    // Earliest holdExpiresAt of the requested seats — used to reject late payments
    expiresAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Fast lookup of all bookings for a user
bookingSchema.index({ user: 1 });

// Useful for show-level reporting
bookingSchema.index({ show: 1 });

// Filter by payment/confirmation state
bookingSchema.index({ status: 1 });

// Combined: user's bookings in a given state (e.g. pending payments)
bookingSchema.index({ user: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
