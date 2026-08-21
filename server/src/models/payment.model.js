const mongoose = require('mongoose');

/**
 * Payment model — records the result of a payment attempt for a booking.
 *
 * Idempotency design:
 * - The compound unique index { booking, idempotencyKey } is the enforcement
 *   mechanism. A second request with the same (booking + key) hits a duplicate
 *   key error, which the service catches and converts into a safe "return
 *   existing" response. This prevents double-charging even under retries or
 *   concurrent requests.
 *
 * - Keys are NOT globally unique across all operations — they are scoped to
 *   a booking. The same UUID submitted for two different bookings creates two
 *   independent Payment records, which is correct behaviour.
 *
 * transactionId:
 * - Generated server-side on SUCCESS only. Null for failed/pending payments.
 * - sparse: true so the unique constraint ignores null values.
 */
const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required']
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      required: true
    },
    // Server-generated UUID written only when payment succeeds
    transactionId: {
      type: String,
      default: null,
      sparse: true,
      unique: true
    },
    // Client-supplied key that scopes idempotency to this booking
    idempotencyKey: {
      type: String,
      required: [true, 'Idempotency key is required']
    }
  },
  { timestamps: true }
);

// Primary idempotency enforcement: same booking + same key → one record only
paymentSchema.index({ booking: 1, idempotencyKey: 1 }, { unique: true });

// Fast lookup by idempotency key alone (used during pre-check)
paymentSchema.index({ idempotencyKey: 1 });

// Lookup all payments for a booking (e.g. admin view)
paymentSchema.index({ booking: 1 });

// Filter by payment outcome
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
