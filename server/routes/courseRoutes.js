const express = require('express');
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getMyInstructorCourses,
  uploadCourseThumbnail,
} = require('../controllers/courseController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { uploadLessonFiles, uploadThumbnail } = require('../middleware/upload');
const { createLesson } = require('../controllers/lessonController');
const { getWatchProgressByCourse } = require('../controllers/watchProgressController');

const router = express.Router();

router
  .route('/')
  .post(protect, authorizeRoles('instructor'), createCourse)
  .get(getAllCourses);

router.get(
  '/instructor/mine',
  protect,
  authorizeRoles('instructor'),
  getMyInstructorCourses,
);

router.post('/:id/enroll', protect, enrollCourse);
router.post(
  '/:id/thumbnail',
  protect,
  authorizeRoles('instructor'),
  uploadThumbnail,
  uploadCourseThumbnail,
);
router.get('/:courseId/progress', protect, getWatchProgressByCourse);
router.post(
  '/:courseId/lessons',
  protect,
  authorizeRoles('instructor'),
  uploadLessonFiles,
  createLesson,
);

router
  .route('/:id')
  .get(getCourseById)
  .put(protect, authorizeRoles('instructor'), updateCourse)
  .delete(protect, authorizeRoles('instructor'), deleteCourse);

module.exports = router;
