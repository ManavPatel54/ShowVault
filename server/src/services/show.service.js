const Show = require('../models/show.model');
const Event = require('../models/event.model');
const Screen = require('../models/screen.model');
const { getCache, setCache, deleteCache } = require('./cache.service');
const cacheKeys = require('../utils/cacheKeys');

const SHOW_TTL = process.env.REDIS_SHOW_TTL ? parseInt(process.env.REDIS_SHOW_TTL, 10) : 30;

const createShow = async (data) => {
  const event = await Event.findOne({ _id: data.event, isActive: true });
  if (!event) {
    const error = new Error('Event not found or inactive');
    error.statusCode = 404;
    throw error;
  }

  const screen = await Screen.findOne({ _id: data.screen, isActive: true });
  if (!screen) {
    const error = new Error('Screen not found or inactive');
    error.statusCode = 404;
    throw error;
  }

  // Overlap checking logic
  const newStartTime = new Date(data.startTime);
  const newEndTime = new Date(data.endTime);

  const overlappingShow = await Show.findOne({
    screen: data.screen,
    status: { $ne: 'CANCELLED' },
    startTime: { $lt: newEndTime },
    endTime: { $gt: newStartTime }
  });

  if (overlappingShow) {
    const error = new Error('Overlapping show exists on this screen');
    error.statusCode = 409;
    throw error;
  }

  const show = new Show(data);
  const savedShow = await show.save();
  
  try {
    const showSeatService = require('./showSeat.service');
    await showSeatService.createInventoryForShow(savedShow._id);
  } catch (error) {
    // Basic rollback if inventory creation fails
    await Show.findByIdAndDelete(savedShow._id);
    throw error;
  }
  
  await deleteCache(cacheKeys.shows.byEvent(savedShow.event));
  
  return savedShow;
};

const getShows = async (query = {}) => {
  // Check if query is exclusively for eventId (or event)
  const eventId = query.eventId || query.event;
  const isOnlyEventQuery = Object.keys(query).length === 1 && eventId;
  let cacheKey;

  if (isOnlyEventQuery) {
    cacheKey = cacheKeys.shows.byEvent(eventId);
    const cachedShows = await getCache(cacheKey);
    if (cachedShows) return cachedShows;
  }

  const shows = await Show.find(query).populate('event').populate('screen');

  if (isOnlyEventQuery) {
    await setCache(cacheKey, shows, SHOW_TTL);
  }
  return shows;
};

const getShowById = async (id) => {
  return await Show.findById(id).populate('event').populate('screen');
};

const updateShow = async (id, data) => {
  // If time or screen is changing, we must check overlap again
  if (data.startTime || data.endTime || data.screen) {
    const existingShow = await Show.findById(id);
    if (!existingShow) {
      const error = new Error('Show not found');
      error.statusCode = 404;
      throw error;
    }

    const screenId = data.screen || existingShow.screen;
    const newStartTime = data.startTime ? new Date(data.startTime) : existingShow.startTime;
    const newEndTime = data.endTime ? new Date(data.endTime) : existingShow.endTime;

    const overlappingShow = await Show.findOne({
      _id: { $ne: id },
      screen: screenId,
      status: { $ne: 'CANCELLED' },
      startTime: { $lt: newEndTime },
      endTime: { $gt: newStartTime }
    });

    if (overlappingShow) {
      const error = new Error('Overlapping show exists on this screen');
      error.statusCode = 409;
      throw error;
    }
  }

  const updatedShow = await Show.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('event').populate('screen');
  
  if (updatedShow) {
    const eventId = updatedShow.event._id ? updatedShow.event._id.toString() : updatedShow.event.toString();
    await deleteCache(cacheKeys.shows.byEvent(eventId));
  }
  
  return updatedShow;
};

const deleteShow = async (id) => {
  const deletedShow = await Show.findByIdAndUpdate(id, { status: 'CANCELLED' }, { new: true }).populate('event').populate('screen');
  
  if (deletedShow) {
    const eventId = deletedShow.event._id ? deletedShow.event._id.toString() : deletedShow.event.toString();
    await deleteCache(cacheKeys.shows.byEvent(eventId));
  }
  
  return deletedShow;
};

module.exports = {
  createShow,
  getShows,
  getShowById,
  updateShow,
  deleteShow
};
