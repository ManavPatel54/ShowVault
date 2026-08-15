const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venue.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, venueController.getVenues);
router.get('/:id', protect, venueController.getVenueById);

router.post('/', protect, authorize('ADMIN'), venueController.createVenue);
router.patch('/:id', protect, authorize('ADMIN'), venueController.updateVenue);
router.delete('/:id', protect, authorize('ADMIN'), venueController.deleteVenue);

module.exports = router;
