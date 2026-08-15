const express = require('express');
const router = express.Router();
const showController = require('../controllers/show.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, showController.getShows);
router.get('/:id', protect, showController.getShowById);

router.post('/', protect, authorize('ADMIN'), showController.createShow);
router.patch('/:id', protect, authorize('ADMIN'), showController.updateShow);
router.delete('/:id', protect, authorize('ADMIN'), showController.deleteShow);

module.exports = router;
