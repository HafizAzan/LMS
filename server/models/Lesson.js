const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  videoUrl: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    min: 0,
    default: 0,
  },
  order: {
    type: Number,
    required: [true, 'Order is required'],
    min: 1,
    default: 1,
  },
  resources: [
    {
      name: {
        type: String,
        required: [true, 'Resource name is required'],
        trim: true,
      },
      fileUrl: {
        type: String,
        required: [true, 'Resource file URL is required'],
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Lesson', lessonSchema);
