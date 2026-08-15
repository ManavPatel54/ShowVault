const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT access token.
 *
 * Payload contains only non-sensitive identity fields:
 *   { userId, role }
 *
 * Secret and expiry are read from environment variables — never hardcoded.
 *
 * @param {object} payload - { userId: string, role: string }
 * @returns {string} Signed JWT string
 */
const generateAccessToken = ({ userId, role }) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );
};

module.exports = { generateAccessToken };
