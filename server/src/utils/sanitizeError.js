/**
 * sanitizeError.js
 *
 * Converts internal errors into user-safe messages.
 * Raw database / driver error strings (e.g. MongoDB SSL errors) must
 * never be forwarded directly to the client — they leak implementation
 * details and confuse end users.
 *
 * Usage in a controller catch block:
 *   res.status(500).json({ success: false, message: sanitizeError(error) });
 */

const SAFE_MESSAGE = 'An unexpected error occurred. Please try again later.';

// Patterns that indicate a driver / network / infrastructure error
// that should never be shown to users.
const INTERNAL_PATTERNS = [
  /ssl/i,
  /tls/i,
  /openssl/i,
  /socket/i,
  /ECONNREFUSED/i,
  /MongoNetworkError/i,
  /MongoServerSelectionError/i,
  /topology/i,
];

const sanitizeError = (error) => {
  const msg = error?.message || '';

  // If the message looks like a driver/network error, hide it
  if (INTERNAL_PATTERNS.some((pattern) => pattern.test(msg))) {
    return SAFE_MESSAGE;
  }

  return msg || SAFE_MESSAGE;
};

module.exports = sanitizeError;
