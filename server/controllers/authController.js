const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
  enrolledCourses: user.enrolledCourses,
  createdAt: user.createdAt,
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id);

    return res.status(201).json({ token });
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: toUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
