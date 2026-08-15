const jwt = require("jsonwebtoken");

/**
 * Auth middleware — validates a Bearer JWT and attaches { userId, role }
 * to req.user. Does NOT query the database; the token itself is the source
 * of truth for identity during a request lifecycle.
 *
 * Rejects with 401 if:
 *  - Authorization header is missing or malformed
 *  - Token is invalid
 *  - Token has expired
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Expect "Authorization: Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a valid access token.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Token is missing.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Attach only what's needed — no database round-trip
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token has expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid access token.",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role ${req.user ? req.user.role : 'UNKNOWN'} is not authorized to access this route.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
