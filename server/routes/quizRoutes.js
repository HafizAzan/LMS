const express = require('express');
const {
  createQuiz,
  getQuizByCourse,
  submitQuizAttempt,
} = require('../controllers/quizController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('instructor'), createQuiz);
router.get('/', protect, getQuizByCourse);
router.get('/course/:courseId', protect, getQuizByCourse);
router.post('/:id/submit', protect, submitQuizAttempt);
router.post('/:quizId/attempts', protect, submitQuizAttempt);

module.exports = router;
