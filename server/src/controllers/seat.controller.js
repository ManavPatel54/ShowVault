const seatService = require('../services/seat.service');
const sanitizeError = require('../utils/sanitizeError');

const createSeat = async (req, res) => {
  try {
    const seat = await seatService.createSeat(req.body);
    res.status(201).json({ success: true, data: seat });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: sanitizeError(error) });
  }
};

const getSeats = async (req, res) => {
  try {
    const seats = await seatService.getSeats(req.query);
    res.status(200).json({ success: true, data: seats });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: sanitizeError(error) });
  }
};

const generateSeatLayout = async (req, res) => {
  try {
    const result = await seatService.generateSeatLayout(req.params.screenId, req.body);
    res.status(200).json({
      success: true,
      message: 'Seat layout generated successfully.',
      data: result
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: sanitizeError(error) });
  }
};

const updateSeat = async (req, res) => {
  try {
    const seat = await seatService.updateSeat(req.params.id, req.body);
    if (!seat) {
      return res.status(404).json({ success: false, message: 'Seat not found' });
    }
    res.status(200).json({ success: true, data: seat });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: sanitizeError(error) });
  }
};

const deleteSeat = async (req, res) => {
  try {
    const seat = await seatService.deleteSeat(req.params.id);
    if (!seat) {
      return res.status(404).json({ success: false, message: 'Seat not found' });
    }
    res.status(200).json({ success: true, data: seat });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

module.exports = {
  createSeat,
  getSeats,
  generateSeatLayout,
  updateSeat,
  deleteSeat
};
