const screenService = require('../services/screen.service');
const sanitizeError = require('../utils/sanitizeError');
const mongoose = require('mongoose');

const createScreen = async (req, res) => {
  try {
    const screen = await screenService.createScreen(req.body);
    res.status(201).json({ success: true, data: screen });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: sanitizeError(error) });
  }
};

const getScreens = async (req, res) => {
  try {
    const { venueId, ...restQuery } = req.query;
    const query = { ...restQuery };

    if (venueId) {
      if (!mongoose.Types.ObjectId.isValid(venueId)) {
        return res.status(400).json({ success: false, message: 'Invalid venue ID' });
      }
      query.venue = venueId;
    }

    const screens = await screenService.getScreens(query);
    res.status(200).json({ success: true, data: screens });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

const getScreenById = async (req, res) => {
  try {
    const screen = await screenService.getScreenById(req.params.id);
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found' });
    }
    res.status(200).json({ success: true, data: screen });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

const updateScreen = async (req, res) => {
  try {
    const screen = await screenService.updateScreen(req.params.id, req.body);
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found' });
    }
    res.status(200).json({ success: true, data: screen });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: sanitizeError(error) });
  }
};

const deleteScreen = async (req, res) => {
  try {
    const screen = await screenService.deleteScreen(req.params.id);
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found' });
    }
    res.status(200).json({ success: true, data: screen });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

module.exports = {
  createScreen,
  getScreens,
  getScreenById,
  updateScreen,
  deleteScreen
};
