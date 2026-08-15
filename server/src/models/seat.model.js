const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
    required: [true, 'Screen reference is required']
  },
  rowLabel: {
    type: String,
    required: [true, 'Row label is required'],
    trim: true
  },
  seatNumber: {
    type: Number,
    required: [true, 'Seat number is required']
  },
  seatType: {
    type: String,
    enum: ['REGULAR', 'PREMIUM', 'VIP'],
    default: 'REGULAR'
  },
  priceMultiplier: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Prevent duplicate seats within a screen
seatSchema.index({ screen: 1, rowLabel: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
