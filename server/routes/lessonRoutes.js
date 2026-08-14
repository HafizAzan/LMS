const express = require('express');
const { saveProgress } = require('../controllers/watchProgressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:lessonId/progress', protect, saveProgress);

module.exports = router;
