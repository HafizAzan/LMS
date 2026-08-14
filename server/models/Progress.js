const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  completedLessons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
  ],
  quizScores: [
    {
      quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
    },
  ],
  overallPercent: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  lastReminderSentAt: {
    type: Date,
    default: null,
  },
});

progressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
