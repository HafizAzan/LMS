const mongoose = require('mongoose');

const watchProgressSchema = new mongoose.Schema({
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
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  position: {
    type: Number,
    default: 0,
    min: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

watchProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('WatchProgress', watchProgressSchema);
