const mongoose = require('mongoose');
const Seat = require('../models/seat.model');
const Screen = require('../models/screen.model');

const createSeat = async (data) => {
  const screen = await Screen.findOne({ _id: data.screen, isActive: true });
  if (!screen) {
    const error = new Error('Screen not found or inactive');
    error.statusCode = 404;
    throw error;
  }

  try {
    const seat = new Seat(data);
    return await seat.save();
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('Seat with this row and number already exists on this screen');
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};

const getSeats = async (query = {}) => {
  const filter = { isActive: true };

  const targetScreenId = query.screenId || query.screen;
  if (targetScreenId) {
    if (!mongoose.Types.ObjectId.isValid(targetScreenId)) {
      const error = new Error('Invalid screen ID');
      error.statusCode = 400;
      throw error;
    }
    filter.screen = targetScreenId;
  }

  return await Seat.find(filter);
};

const generateSeatLayout = async (screenId, options = {}) => {
  if (!mongoose.Types.ObjectId.isValid(screenId)) {
    const error = new Error('Invalid screen ID');
    error.statusCode = 400;
    throw error;
  }

  const screen = await Screen.findOne({ _id: screenId, isActive: true });
  if (!screen) {
    const error = new Error('Screen not found or inactive');
    error.statusCode = 404;
    throw error;
  }

  const {
    startRow = 'A',
    rows = screen.totalRows || 10,
    seatsPerRow = screen.totalColumns || 10,
    seatType = 'REGULAR',
    priceMultiplier = 1
  } = options;

  const parsedRows = parseInt(rows, 10);
  const parsedSeatsPerRow = parseInt(seatsPerRow, 10);
  const parsedPriceMultiplier = parseFloat(priceMultiplier);

  if (isNaN(parsedRows) || parsedRows <= 0 || isNaN(parsedSeatsPerRow) || parsedSeatsPerRow <= 0) {
    const error = new Error('Rows and seatsPerRow must be positive numbers');
    error.statusCode = 400;
    throw error;
  }

  if (isNaN(parsedPriceMultiplier) || parsedPriceMultiplier < 0) {
    const error = new Error('Price multiplier must be greater than or equal to 0');
    error.statusCode = 400;
    throw error;
  }

  const validSeatTypes = ['REGULAR', 'PREMIUM', 'VIP'];
  if (!validSeatTypes.includes(seatType)) {
    const error = new Error('Invalid seat type');
    error.statusCode = 400;
    throw error;
  }

  // Fetch existing active seats for this screen to prevent duplicates
  const existingSeats = await Seat.find({ screen: screenId, isActive: true });
  const existingSet = new Set(existingSeats.map(s => `${s.rowLabel}-${s.seatNumber}`));

  const startChar = (typeof startRow === 'string' && startRow.length > 0) ? startRow.trim().toUpperCase() : 'A';
  const startCharCode = startChar.charCodeAt(0);

  const newSeats = [];
  let skippedCount = 0;

  for (let r = 0; r < parsedRows; r++) {
    const rowLabel = String.fromCharCode(startCharCode + r);
    for (let s = 1; s <= parsedSeatsPerRow; s++) {
      const key = `${rowLabel}-${s}`;
      if (existingSet.has(key)) {
        skippedCount++;
      } else {
        newSeats.push({
          screen: screenId,
          rowLabel,
          seatNumber: s,
          seatType,
          priceMultiplier: parsedPriceMultiplier,
          isActive: true
        });
      }
    }
  }

  let createdCount = 0;
  if (newSeats.length > 0) {
    const inserted = await Seat.insertMany(newSeats, { ordered: false });
    createdCount = inserted.length;
  }

  return {
    created: createdCount,
    skipped: skippedCount,
    total: createdCount + skippedCount
  };
};

const updateSeat = async (id, data) => {
  try {
    return await Seat.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('Seat with this row and number already exists on this screen');
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};

const deleteSeat = async (id) => {
  return await Seat.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

module.exports = {
  createSeat,
  getSeats,
  generateSeatLayout,
  updateSeat,
  deleteSeat
};
