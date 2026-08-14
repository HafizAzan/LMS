const express = require('express');
const {
  createCheckoutSession,
  confirmCheckoutSession,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/confirm', protect, confirmCheckoutSession);

module.exports = router;
