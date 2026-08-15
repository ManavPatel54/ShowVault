const Screen = require('../models/screen.model');
const Venue = require('../models/venue.model');

const createScreen = async (data) => {
  const venue = await Venue.findOne({ _id: data.venue, isActive: true });
  if (!venue) {
    const error = new Error('Venue not found or inactive');
    error.statusCode = 404;
    throw error;
  }
  
  try {
    const screen = new Screen(data);
    return await screen.save();
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('Screen number already exists in this venue');
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};

const getScreens = async (query = {}) => {
  return await Screen.find({ isActive: true, ...query }).populate('venue');
};

const getScreenById = async (id) => {
  return await Screen.findById(id).populate('venue');
};

const updateScreen = async (id, data) => {
  try {
    return await Screen.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('venue');
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('Screen number already exists in this venue');
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};

const deleteScreen = async (id) => {
  return await Screen.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

module.exports = {
  createScreen,
  getScreens,
  getScreenById,
  updateScreen,
  deleteScreen
};
