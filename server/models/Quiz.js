const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['mcq', 'true_false', 'fill_blank'],
    required: [true, 'Question type is required'],
  },
  options: {
    type: [String],
    default: [],
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
  },
});

const quizSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required'],
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    default: null,
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: (questions) => Array.isArray(questions) && questions.length > 0,
      message: 'A quiz must have at least one question',
    },
  },
});

module.exports = mongoose.model('Quiz', quizSchema);
