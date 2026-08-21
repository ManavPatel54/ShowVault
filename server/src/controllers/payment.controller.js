const paymentService = require('../services/payment.service');
const sanitizeError = require('../utils/sanitizeError');

/**
 * POST /api/payments/process
 *
 * Headers required:
 *   Authorization:   Bearer <JWT>
 *   Idempotency-Key: <unique string>
 *
 * Body:
 *   { bookingId: string, result: 'SUCCESS' | 'FAILED' }
 *
 * The controller reads the Idempotency-Key from the header (case-insensitive)
 * and passes it to the service. It never trusts userId or amount from the body.
 */
const processPayment = async (req, res) => {
  try {
    const { bookingId, result } = req.body;
    const userId = req.user.userId; // from JWT — never from body

    // Read header (express lowercases all headers)
    const idempotencyKey = req.headers['idempotency-key'];

    if (!idempotencyKey) {
      return res.status(400).json({
        success: false,
        message: 'Idempotency-Key header is required'
      });
    }

    const { payment, booking, idempotent } = await paymentService.processPayment(
      userId,
      bookingId,
      idempotencyKey,
      result
    );

    return res.status(200).json({
      success: true,
      idempotent, // tells client whether this was a fresh or replayed operation
      data: { payment, booking }
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: sanitizeError(error)
    });
  }
};

module.exports = { processPayment };
