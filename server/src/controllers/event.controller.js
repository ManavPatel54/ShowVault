const eventService = require('../services/event.service');
const sanitizeError = require('../utils/sanitizeError');

const createEvent = async (req, res) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: sanitizeError(error) });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await eventService.getEvents(req.query);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: sanitizeError(error) });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await eventService.deleteEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
};
