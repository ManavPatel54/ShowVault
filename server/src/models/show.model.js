const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event reference is required']
  },
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
    required: [true, 'Screen reference is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'CANCELLED', 'COMPLETED'],
    default: 'SCHEDULED'
  }
}, { timestamps: true });

// Prevent overlapping queries from being slow
showSchema.index({ screen: 1, startTime: 1 });

// Custom validation to ensure endTime is after startTime
showSchema.pre('validate', function (next) {
  if (this.startTime && this.endTime) {
    if (this.endTime <= this.startTime) {
      this.invalidate('endTime', 'End time must be after start time');
    }
  }
  next();
});

module.exports = mongoose.model('Show', showSchema);
