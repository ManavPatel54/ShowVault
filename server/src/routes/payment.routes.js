const express = require('express');
const { processPayment } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Process a simulated payment (requires Idempotency-Key header)
router.post('/process', protect, processPayment);

module.exports = router;
