const Event = require('../models/event.model');
const { getCache, setCache, deleteCache } = require('./cache.service');
const cacheKeys = require('../utils/cacheKeys');

const EVENT_TTL = process.env.REDIS_EVENT_TTL ? parseInt(process.env.REDIS_EVENT_TTL, 10) : 60;

const createEvent = async (data) => {
  const event = new Event(data);
  const savedEvent = await event.save();
  await deleteCache(cacheKeys.events.all());
  return savedEvent;
};

const getEvents = async (query = {}) => {
  // Only cache the default "fetch all active events" query
  const isDefaultQuery = Object.keys(query).length === 0;
  const cacheKey = cacheKeys.events.all();

  if (isDefaultQuery) {
    const cachedData = await getCache(cacheKey);
    if (cachedData) return cachedData;
  }

  const events = await Event.find({ isActive: true, ...query });

  if (isDefaultQuery) {
    await setCache(cacheKey, events, EVENT_TTL);
  }
  return events;
};

const getEventById = async (id) => {
  const cacheKey = cacheKeys.events.byId(id);
  const cachedData = await getCache(cacheKey);
  if (cachedData) return cachedData;

  const event = await Event.findById(id);

  if (event) {
    await setCache(cacheKey, event, EVENT_TTL);
  }
  return event;
};

const updateEvent = async (id, data) => {
  const updatedEvent = await Event.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (updatedEvent) {
    await deleteCache(cacheKeys.events.all());
    await deleteCache(cacheKeys.events.byId(id));
  }
  return updatedEvent;
};

const deleteEvent = async (id) => {
  const deletedEvent = await Event.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (deletedEvent) {
    await deleteCache(cacheKeys.events.all());
    await deleteCache(cacheKeys.events.byId(id));
  }
  return deletedEvent;
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
};
