const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seat.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, seatController.getSeats);

router.post('/', protect, authorize('ADMIN'), seatController.createSeat);
router.patch('/:id', protect, authorize('ADMIN'), seatController.updateSeat);
router.delete('/:id', protect, authorize('ADMIN'), seatController.deleteSeat);

module.exports = router;
