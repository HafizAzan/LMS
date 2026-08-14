const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { readAuthToken } = require('../utils/cookies');

const protect = async (req, res, next) => {
  try {
    const token = readAuthToken(req);

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    if (user.isEmailVerified === false) {
      return res.status(403).json({
        message: 'Please verify your email to continue',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    return res.status(401).json({ message: 'Not authorized' });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      message: 'Not authorized to access this resource',
    });
  }

  next();
};

module.exports = { protect, authorizeRoles };
