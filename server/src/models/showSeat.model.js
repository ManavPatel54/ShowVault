const mongoose = require('mongoose');

const showSeatSchema = new mongoose.Schema({
  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show',
    required: true
  },
  seat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat',
    required: true
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'HELD', 'BOOKED'],
    default: 'AVAILABLE',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  heldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  holdExpiresAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Primary lookup: one seat per show (enforces uniqueness)
showSeatSchema.index({ show: 1, seat: 1 }, { unique: true });

// Efficient availability queries: list all seats for a show filtered by status
showSeatSchema.index({ show: 1, status: 1 });

const ShowSeat = mongoose.model('ShowSeat', showSeatSchema);

module.exports = ShowSeat;

