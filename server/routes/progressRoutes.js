const express = require('express');
const {
  markLessonComplete,
  getProgressByCourse,
  getMyLearning,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getMyLearning);
router.get('/:courseId', protect, getProgressByCourse);
router.post(
  '/:courseId/lessons/:lessonId/complete',
  protect,
  markLessonComplete,
);

module.exports = router;
