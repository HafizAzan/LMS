const express = require('express');
const {
  getCourseAnalytics,
  getOverview,
} = require('../controllers/instructorController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/overview', protect, authorizeRoles('instructor'), getOverview);
router.get(
  '/courses/:id/analytics',
  protect,
  authorizeRoles('instructor'),
  getCourseAnalytics,
);

module.exports = router;
