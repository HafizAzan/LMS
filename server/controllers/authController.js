const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { setAuthCookie, clearAuthCookie } = require('../utils/cookies');
const { setOtp, assertOtp, clearOtp, canResendOtp, remainingMs, OTP_TTL_MS } = require('../utils/otp');
const { sendOtpEmail } = require('../utils/otp-email');

const OTP_FIELDS = '+otpHash +otpExpiresAt +otpPurpose +otpAttempts';

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET in .env');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const toUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isEmailVerified: user.isEmailVerified,
  enrolledCourses: user.enrolledCourses,
  createdAt: user.createdAt,
});

const issueSession = (res, user) => {
  const token = generateToken(user._id);
  setAuthCookie(res, token);
  return { user: toUserResponse(user) };
};

const sendAndRespondOtp = async (res, user, purpose, message) => {
  const otp = await setOtp(user, purpose);
  await sendOtpEmail({ to: user.email, name: user.name, otp, purpose });
  return res.status(200).json({
    message,
    email: user.email,
    expiresIn: Math.round(OTP_TTL_MS / 1000),
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password',
      });
    }

    const existingUser = await User.findOne({ email }).select(OTP_FIELDS);
    if (existingUser) {
      if (existingUser.isEmailVerified !== false) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
      existingUser.name = name;
      existingUser.password = password;
      existingUser.role = role || existingUser.role;
      await existingUser.save();
      return sendAndRespondOtp(
        res,
        existingUser,
        'verify',
        'Check your email for a verification code',
      );
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      isEmailVerified: false,
    });
    const saved = await User.findById(user._id).select(OTP_FIELDS);
    return sendAndRespondOtp(res, saved, 'verify', 'Check your email for a verification code');
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    return res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select(OTP_FIELDS);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isEmailVerified === false) {
      if (canResendOtp(user)) {
        const otp = await setOtp(user, 'verify');
        await sendOtpEmail({ to: user.email, name: user.name, otp, purpose: 'verify' });
      }
      return res.status(403).json({
        message: 'Please verify your email to continue',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
        expiresIn: Math.round(remainingMs(user) / 1000) || Math.round(OTP_TTL_MS / 1000),
      });
    }

    return res.status(200).json(issueSession(res, user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const user = await User.findOne({ email }).select(OTP_FIELDS);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    await assertOtp(user, otp, 'verify');
    user.isEmailVerified = true;
    await clearOtp(user);
    return res.status(200).json(issueSession(res, user));
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email, purpose = 'verify' } = req.body;
    if (!email || !['verify', 'reset'].includes(purpose)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }

    const user = await User.findOne({ email }).select(OTP_FIELDS);
    if (!user) {
      return res.status(200).json({
        message: 'If an account exists, a new code was sent',
        expiresIn: Math.round(OTP_TTL_MS / 1000),
      });
    }

    if (purpose === 'verify' && user.isEmailVerified !== false) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    if (!canResendOtp(user) && user.otpPurpose === purpose) {
      return res.status(429).json({
        message: 'Wait until the current code expires before requesting a new one',
        expiresIn: Math.round(remainingMs(user) / 1000),
      });
    }

    const otp = await setOtp(user, purpose);
    await sendOtpEmail({ to: user.email, name: user.name, otp, purpose });
    return res.status(200).json({
      message: 'A new code was sent to your email',
      email: user.email,
      expiresIn: Math.round(OTP_TTL_MS / 1000),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email }).select(OTP_FIELDS);
    if (user && (canResendOtp(user) || user.otpPurpose !== 'reset')) {
      const otp = await setOtp(user, 'reset');
      await sendOtpEmail({ to: user.email, name: user.name, otp, purpose: 'reset' });
    }

    const wait = user ? remainingMs(user) : OTP_TTL_MS;
    return res.status(200).json({
      message: 'If an account exists, we sent a reset code',
      expiresIn: Math.round((wait || OTP_TTL_MS) / 1000),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, code, and new password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email }).select(OTP_FIELDS);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    await assertOtp(user, otp, 'reset');
    user.password = password;
    user.isEmailVerified = true;
    await clearOtp(user);
    return res.status(200).json(issueSession(res, user));
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const logoutUser = async (_req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ message: 'Logged out' });
};

const getMe = async (req, res) => {
  return res.status(200).json({ user: toUserResponse(req.user) });
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
  logoutUser,
  getMe,
};
