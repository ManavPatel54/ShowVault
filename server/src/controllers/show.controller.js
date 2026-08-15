const showService = require('../services/show.service');
const sanitizeError = require('../utils/sanitizeError');

const createShow = async (req, res) => {
  try {
    const show = await showService.createShow(req.body);
    res.status(201).json({ success: true, data: show });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: sanitizeError(error) });
  }
};

const getShows = async (req, res) => {
  try {
    const shows = await showService.getShows(req.query);
    res.status(200).json({ success: true, data: shows });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

const getShowById = async (req, res) => {
  try {
    const show = await showService.getShowById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    res.status(200).json({ success: true, data: show });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

const updateShow = async (req, res) => {
  try {
    const show = await showService.updateShow(req.params.id, req.body);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    res.status(200).json({ success: true, data: show });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: sanitizeError(error) });
  }
};

const deleteShow = async (req, res) => {
  try {
    const show = await showService.deleteShow(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    res.status(200).json({ success: true, data: show });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

module.exports = {
  createShow,
  getShows,
  getShowById,
  updateShow,
  deleteShow
};
