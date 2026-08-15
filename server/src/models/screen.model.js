const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: [true, 'Venue reference is required']
  },
  name: {
    type: String,
    required: [true, 'Screen name is required'],
    trim: true
  },
  screenNumber: {
    type: Number,
    required: [true, 'Screen number is required']
  },
  totalRows: {
    type: Number,
    required: [true, 'Total rows is required']
  },
  totalColumns: {
    type: Number,
    required: [true, 'Total columns is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Prevent duplicate screen numbers within the same venue
screenSchema.index({ venue: 1, screenNumber: 1 }, { unique: true });

module.exports = mongoose.model('Screen', screenSchema);
