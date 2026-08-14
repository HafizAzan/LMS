const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { recordQuizScore } = require('./progressController');

const PASSING_SCORE = 70;

const normalizeAnswer = (value) => String(value ?? '').trim().toLowerCase();

const toStudentQuiz = (quiz) => {
  const obj = quiz.toObject();
  obj.questions = obj.questions.map(({ correctAnswer, ...question }) => question);
  return obj;
};

const createQuiz = async (req, res) => {
  try {
    const { course, lesson, questions } = req.body;

    if (!course || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: 'Please provide a course and at least one question',
      });
    }

    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (courseDoc.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to create a quiz for this course',
      });
    }

    const lessonId = lesson || null;
    const existing = await Quiz.findOne({
      course,
      lesson: lessonId,
    });

    if (existing) {
      existing.questions = questions;
      await existing.save();
      return res.status(200).json(existing);
    }

    const quiz = await Quiz.create({
      course,
      lesson: lessonId,
      questions,
    });

    return res.status(201).json(quiz);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

const getQuizByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId || req.query.courseId;
    const lessonId = req.params.lessonId || req.query.lessonId;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const filter = { course: courseId };
    if (lessonId) {
      filter.lesson = lessonId;
    } else {
      filter.lesson = null;
    }

    let quizzes = await Quiz.find(filter).populate('lesson', 'title order');
    if (!lessonId && quizzes.length === 0) {
      quizzes = await Quiz.find({ course: courseId }).populate('lesson', 'title order');
    }

    const isInstructor = req.user?.role === 'instructor';
    const payload = isInstructor ? quizzes : quizzes.map(toStudentQuiz);

    return res.status(200).json({ quizzes: payload });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

const submitQuizAttempt = async (req, res) => {
  try {
    const quizId = req.params.quizId || req.params.id;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Please provide an answers array' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const total = quiz.questions.length;
    let correctCount = 0;

    const results = quiz.questions.map((question, index) => {
      const submitted = answers[index];
      const given =
        submitted && typeof submitted === 'object' && submitted.answer !== undefined
          ? submitted.answer
          : submitted;
      const isCorrect =
        normalizeAnswer(given) === normalizeAnswer(question.correctAnswer);

      if (isCorrect) {
        correctCount += 1;
      }

      return {
        questionId: question._id,
        questionText: question.questionText,
        type: question.type,
        options: question.options,
        submittedAnswer: given ?? '',
        correctAnswer: question.correctAnswer,
        isCorrect,
      };
    });

    const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    const passed = score >= PASSING_SCORE;

    const attempt = await QuizAttempt.create({
      user: req.user._id,
      quiz: quiz._id,
      answers,
      score,
      passed,
    });

    await recordQuizScore(req.user._id, quiz.course, quiz._id, score);

    return res.status(201).json({
      attempt,
      score,
      passed,
      correctCount,
      total,
      results,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid quiz ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createQuiz, getQuizByCourse, submitQuizAttempt };
