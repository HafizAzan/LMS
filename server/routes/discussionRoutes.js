const express = require('express');
const {
  getDiscussions,
  createDiscussion,
  addReply,
} = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getDiscussions);
router.post('/', protect, createDiscussion);
router.post('/:id/replies', protect, addReply);

module.exports = router;
