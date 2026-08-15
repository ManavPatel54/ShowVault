const ShowSeat = require('../models/showSeat.model');
const Show = require('../models/show.model');
const Screen = require('../models/screen.model');
const Seat = require('../models/seat.model');
const mongoose = require('mongoose');

/**
 * Compute hold duration in milliseconds from environment variable.
 * Falls back to 5 minutes if the variable is missing or malformed.
 */
const getHoldDurationMs = () => {
  const minutes = parseFloat(process.env.SEAT_HOLD_MINUTES);
  if (!isNaN(minutes) && minutes > 0) {
    return minutes * 60 * 1000;
  }
  return 5 * 60 * 1000; // default: 5 minutes
};

// ---------------------------------------------------------------------------
// Inventory creation
// ---------------------------------------------------------------------------

const createInventoryForShow = async (showId) => {
  const show = await Show.findById(showId);
  if (!show) {
    throw new Error('Show not found');
  }

  const screen = await Screen.findOne({ _id: show.screen, isActive: true });
  if (!screen) {
    throw new Error('Screen not found or inactive');
  }

  const seats = await Seat.find({ screen: screen._id, isActive: true });

  if (seats.length === 0) {
    return [];
  }

  const bulkOps = seats.map((seat) => {
    let calculatedPrice = show.basePrice * (seat.priceMultiplier || 1);
    calculatedPrice = Math.round(calculatedPrice * 100) / 100;

    return {
      updateOne: {
        filter: { show: showId, seat: seat._id },
        update: {
          $setOnInsert: {
            show: showId,
            seat: seat._id,
            status: 'AVAILABLE',
            price: calculatedPrice,
            heldBy: null,
            holdExpiresAt: null
          }
        },
        upsert: true
      }
    };
  });

  await ShowSeat.bulkWrite(bulkOps);
};

// ---------------------------------------------------------------------------
// Read — show seat list
// Expired HELD seats are normalized to AVAILABLE in the response so that
// the client never sees a phantom hold without a background worker.
// ---------------------------------------------------------------------------

const getShowSeats = async (showId) => {
  const now = new Date();
  const seats = await ShowSeat.find({ show: showId })
    .populate({
      path: 'show',
      select: 'event screen startTime endTime basePrice status',
      populate: [
        {
          path: 'event',
          select: 'title category language durationMinutes'
        },
        {
          path: 'screen',
          select: 'name screenNumber totalRows totalColumns'
        }
      ]
    })
    .populate('seat', 'rowLabel seatNumber seatType priceMultiplier')
    .populate('heldBy', 'name email');

  return seats.map((ss) => {
    // If this seat is HELD but the hold has expired, present it as AVAILABLE
    const effectiveStatus =
      ss.status === 'HELD' && ss.holdExpiresAt && ss.holdExpiresAt <= now
        ? 'AVAILABLE'
        : ss.status;

    return {
      _id: ss._id,
      show: ss.show,
      seat: ss.seat,
      status: effectiveStatus,
      price: ss.price,
      heldBy: effectiveStatus === 'HELD' ? ss.heldBy : null,
      // Expose holdExpiresAt only for genuine active holds
      holdExpiresAt: effectiveStatus === 'HELD' ? ss.holdExpiresAt : null
    };
  });
};

const getShowSeatById = async (id) => {
  return await ShowSeat.findById(id)
    .populate({
      path: 'show',
      select: 'event screen startTime endTime basePrice status',
      populate: [
        {
          path: 'event',
          select: 'title category language durationMinutes'
        },
        {
          path: 'screen',
          select: 'name screenNumber totalRows totalColumns'
        }
      ]
    })
    .populate('seat', 'rowLabel seatNumber seatType priceMultiplier')
    .populate('heldBy', 'name email');
};

// ---------------------------------------------------------------------------
// LOCK — atomic conditional update
//
// This is the heart of Phase 4. We use a single findOneAndUpdate call so that
// the "check and claim" is one indivisible MongoDB operation. Two concurrent
// requests for the same seat will race at the database level; MongoDB's
// document-level locking guarantees only one update wins the match.
//
// The filter only matches when the seat is genuinely claimable:
//   • status is AVAILABLE, OR
//   • status is HELD but holdExpiresAt is in the past (expired hold)
// ---------------------------------------------------------------------------

const lockSeat = async (showSeatId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(showSeatId)) {
    const err = new Error('Invalid ShowSeat ID');
    err.statusCode = 400;
    throw err;
  }

  // First verify the document exists at all (produces a clean 404)
  const exists = await ShowSeat.exists({ _id: showSeatId });
  if (!exists) {
    const err = new Error('ShowSeat not found');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date();
  const holdDurationMs = getHoldDurationMs();
  const holdExpiresAt = new Date(now.getTime() + holdDurationMs);

  // Atomic: match only when seat is claimable, then set in one operation
  const updated = await ShowSeat.findOneAndUpdate(
    {
      _id: showSeatId,
      $or: [
        { status: 'AVAILABLE' },
        { status: 'HELD', holdExpiresAt: { $lte: now } }
      ]
    },
    {
      $set: {
        status: 'HELD',
        heldBy: userId,
        holdExpiresAt
      }
    },
    { new: true }
  ).populate('seat', 'rowLabel seatNumber seatType');

  // null means nothing matched → seat is actively held by someone else
  // (or already BOOKED — also correctly rejected by the filter)
  return updated; // null signals 409 to the controller
};

// ---------------------------------------------------------------------------
// RELEASE — ownership-checked atomic release
//
// Filter ensures only the holding user can release their own seat.
// If the hold has already expired we still clean it up gracefully —
// there is no harm in clearing an expired hold owned by this user.
// ---------------------------------------------------------------------------

const releaseSeat = async (showSeatId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(showSeatId)) {
    const err = new Error('Invalid ShowSeat ID');
    err.statusCode = 400;
    throw err;
  }

  // Verify document exists for a clean 404
  const seat = await ShowSeat.findById(showSeatId);
  if (!seat) {
    const err = new Error('ShowSeat not found');
    err.statusCode = 404;
    throw err;
  }

  // Do not allow releasing a BOOKED seat under any circumstances
  if (seat.status === 'BOOKED') {
    const err = new Error('Cannot release a booked seat.');
    err.statusCode = 409;
    throw err;
  }

  // Atomic: match only if this user owns the hold
  const updated = await ShowSeat.findOneAndUpdate(
    {
      _id: showSeatId,
      status: 'HELD',
      heldBy: userId
    },
    {
      $set: {
        status: 'AVAILABLE',
        heldBy: null,
        holdExpiresAt: null
      }
    },
    { new: true }
  );

  // null means this user does not own the hold → 403
  return updated; // null signals 403 to the controller
};

module.exports = {
  createInventoryForShow,
  getShowSeats,
  getShowSeatById,
  lockSeat,
  releaseSeat
};
