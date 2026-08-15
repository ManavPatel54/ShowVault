const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, eventController.getEvents);
router.get('/:id', protect, eventController.getEventById);

router.post('/', protect, authorize('ADMIN'), eventController.createEvent);
router.patch('/:id', protect, authorize('ADMIN'), eventController.updateEvent);
router.delete('/:id', protect, authorize('ADMIN'), eventController.deleteEvent);

module.exports = router;
