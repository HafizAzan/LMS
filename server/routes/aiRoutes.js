const express = require('express');
const { askAssistant, generateQuiz } = require('../controllers/aiController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/chat', protect, askAssistant);
router.post('/quiz', protect, authorizeRoles('instructor'), generateQuiz);

module.exports = router;
