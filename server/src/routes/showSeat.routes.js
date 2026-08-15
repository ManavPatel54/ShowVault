const express = require('express');
const {
  getShowSeats,
  getShowSeatById,
  lockSeat,
  releaseSeat
} = require('../controllers/showSeat.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// ── Read ─────────────────────────────────────────────────────────────────────

// List all seats for a show (normalises expired holds to AVAILABLE)
router.get('/shows/:showId/seats', protect, getShowSeats);

// Get a single ShowSeat document by its own ID
router.get('/show-seats/:id', protect, getShowSeatById);

// ── Locking ───────────────────────────────────────────────────────────────────

// Lock a seat (atomic, race-condition-safe)
router.post('/show-seats/:id/lock', protect, lockSeat);

// Release a seat (only the holding user may release)
router.post('/show-seats/:id/release', protect, releaseSeat);

module.exports = router;
