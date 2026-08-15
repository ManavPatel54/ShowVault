const Event = require('../models/event.model');

const createEvent = async (data) => {
  const event = new Event(data);
  return await event.save();
};

const getEvents = async (query = {}) => {
  return await Event.find({ isActive: true, ...query });
};

const getEventById = async (id) => {
  return await Event.findById(id);
};

const updateEvent = async (id, data) => {
  return await Event.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteEvent = async (id) => {
  return await Event.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
};
