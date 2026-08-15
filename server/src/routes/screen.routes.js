const express = require('express');
const router = express.Router();
const screenController = require('../controllers/screen.controller');
const seatController = require('../controllers/seat.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, screenController.getScreens);
router.get('/:id', protect, screenController.getScreenById);

router.post('/', protect, authorize('ADMIN'), screenController.createScreen);
router.post('/:screenId/generate-seats', protect, authorize('ADMIN'), seatController.generateSeatLayout);
router.patch('/:id', protect, authorize('ADMIN'), screenController.updateScreen);
router.delete('/:id', protect, authorize('ADMIN'), screenController.deleteScreen);

module.exports = router;
