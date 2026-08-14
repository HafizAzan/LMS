const express = require('express');
const {
  registerUser,
  loginUser,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
  logoutUser,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

module.exports = router;
