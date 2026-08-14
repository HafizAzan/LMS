const express = require('express');
const { generateCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:courseId', protect, generateCertificate);

module.exports = router;
