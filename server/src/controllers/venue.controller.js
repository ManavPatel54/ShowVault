const venueService = require('../services/venue.service');
const sanitizeError = require('../utils/sanitizeError');

const createVenue = async (req, res) => {
  try {
    const venue = await venueService.createVenue(req.body);
    res.status(201).json({ success: true, data: venue });
  } catch (error) {
    res.status(400).json({ success: false, message: sanitizeError(error) });
  }
};

const getVenues = async (req, res) => {
  try {
    const venues = await venueService.getVenues(req.query);
    res.status(200).json({ success: true, data: venues });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

const getVenueById = async (req, res) => {
  try {
    const venue = await venueService.getVenueById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    res.status(200).json({ success: true, data: venue });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

const updateVenue = async (req, res) => {
  try {
    const venue = await venueService.updateVenue(req.params.id, req.body);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    res.status(200).json({ success: true, data: venue });
  } catch (error) {
    res.status(400).json({ success: false, message: sanitizeError(error) });
  }
};

const deleteVenue = async (req, res) => {
  try {
    const venue = await venueService.deleteVenue(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    res.status(200).json({ success: true, data: venue });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

module.exports = {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue
};
