const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz is required'],
  },
  answers: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  passed: {
    type: Boolean,
    default: false,
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
