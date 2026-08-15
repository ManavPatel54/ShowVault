const Venue = require('../models/venue.model');

const createVenue = async (data) => {
  const venue = new Venue(data);
  return await venue.save();
};

const getVenues = async (query = {}) => {
  return await Venue.find({ isActive: true, ...query });
};

const getVenueById = async (id) => {
  return await Venue.findById(id);
};

const updateVenue = async (id, data) => {
  return await Venue.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteVenue = async (id) => {
  // Soft delete
  return await Venue.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

module.exports = {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue
};
