const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['MOVIE', 'CONCERT', 'SPORTS', 'THEATRE', 'OTHER'],
    default: 'MOVIE'
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  language: {
    type: String,
    trim: true
  },
  releaseDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Optional: index for faster searching
eventSchema.index({ title: 1, category: 1 });

module.exports = mongoose.model('Event', eventSchema);
