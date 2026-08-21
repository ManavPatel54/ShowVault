import api from './api';

/**
 * Process a simulated payment.
 *
 * Sends the Idempotency-Key header to ensure the server-side de-duplication
 * mechanism works correctly. The key should be generated once per payment
 * attempt and reused for retries (stored in useRef on the Payment page).
 *
 * @param {string} bookingId
 * @param {'SUCCESS'|'FAILED'} result
 * @param {string} idempotencyKey - generated once per payment attempt
 */
export const processPayment = async (bookingId, result, idempotencyKey) => {
  const response = await api.post(
    '/payments/process',
    { bookingId, result },
    {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    }
  );
  return response.data;
};
