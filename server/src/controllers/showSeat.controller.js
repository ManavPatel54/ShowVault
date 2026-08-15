const showSeatService = require('../services/showSeat.service');
const sanitizeError = require('../utils/sanitizeError');

// ---------------------------------------------------------------------------
// GET /api/shows/:showId/seats
// Returns all ShowSeat records for a show.
// Expired HELD seats are presented as AVAILABLE (normalised in the service).
// ---------------------------------------------------------------------------
const getShowSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showSeats = await showSeatService.getShowSeats(showId);

    if (!showSeats || showSeats.length === 0) {
      return res.status(404).json({ success: false, message: 'No seats found for this show' });
    }

    res.status(200).json({
      success: true,
      data: {
        show: showSeats[0].show,
        seats: showSeats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

// ---------------------------------------------------------------------------
// GET /api/show-seats/:id
// ---------------------------------------------------------------------------
const getShowSeatById = async (req, res) => {
  try {
    const { id } = req.params;
    const showSeat = await showSeatService.getShowSeatById(id);

    if (!showSeat) {
      return res.status(404).json({ success: false, message: 'Show seat not found' });
    }

    res.status(200).json({ success: true, data: showSeat });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

// ---------------------------------------------------------------------------
// POST /api/show-seats/:id/lock
// Authenticated user locks a seat for SEAT_HOLD_MINUTES minutes.
// Uses req.user.userId from the JWT — never trusts the request body.
// ---------------------------------------------------------------------------
const lockSeat = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user; // set by protect middleware from JWT

    const updated = await showSeatService.lockSeat(id, userId);

    if (!updated) {
      // The atomic filter did not match → seat is actively held or booked
      return res.status(409).json({
        success: false,
        message: 'Seat is currently held by another user.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seat locked successfully.',
      data: {
        _id: updated._id,
        status: updated.status,
        heldBy: updated.heldBy,
        holdExpiresAt: updated.holdExpiresAt,
        price: updated.price,
        seat: updated.seat
      }
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/show-seats/:id/release
// The holding user releases their own hold.
// A different user receives 403. A BOOKED seat cannot be released.
// ---------------------------------------------------------------------------
const releaseSeat = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user; // set by protect middleware from JWT

    const updated = await showSeatService.releaseSeat(id, userId);

    if (!updated) {
      // Document exists but this user does not own the hold
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own the hold on this seat.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seat released successfully.',
      data: {
        _id: updated._id,
        status: updated.status,
        heldBy: updated.heldBy,
        holdExpiresAt: updated.holdExpiresAt,
        price: updated.price,
        seat: updated.seat
      }
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

module.exports = {
  getShowSeats,
  getShowSeatById,
  lockSeat,
  releaseSeat
};
