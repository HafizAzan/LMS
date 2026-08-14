const express = require('express');
const {
  createReview,
  getReviewsByCourse,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createReview);
router.get('/', getReviewsByCourse);
router.get('/course/:courseId', getReviewsByCourse);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
