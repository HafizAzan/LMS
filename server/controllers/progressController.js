const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const WatchProgress = require('../models/WatchProgress');

const PASSING_SCORE = 70;

const getOrCreateProgress = async (userId, courseId) => {
  let progress = await Progress.findOne({ user: userId, course: courseId });

  if (!progress) {
    progress = await Progress.create({
      user: userId,
      course: courseId,
    });
  }

  return progress;
};

const recalculateOverallPercent = async (progress) => {
  const [lessonCount, quizCount] = await Promise.all([
    Lesson.countDocuments({ course: progress.course }),
    Quiz.countDocuments({ course: progress.course }),
  ]);

  const totalItems = lessonCount + quizCount;
  const completedLessonCount = progress.completedLessons.length;
  const passedQuizzes = progress.quizScores.filter(
    (item) => item.score >= PASSING_SCORE,
  ).length;

  progress.overallPercent =
    totalItems === 0
      ? 0
      : Math.round(((completedLessonCount + passedQuizzes) / totalItems) * 100);
  progress.lastAccessedAt = new Date();

  await progress.save();
  return progress;
};

const completeLessonForUser = async (userId, courseId, lessonId) => {
  const progress = await getOrCreateProgress(userId, courseId);
  const alreadyCompleted = progress.completedLessons.some(
    (id) => id.toString() === lessonId.toString(),
  );

  if (!alreadyCompleted) {
    progress.completedLessons.push(lessonId);
  }

  return recalculateOverallPercent(progress);
};

const markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    const [course, lesson] = await Promise.all([
      Course.findById(courseId),
      Lesson.findById(lessonId),
    ]);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!lesson || lesson.course.toString() !== course._id.toString()) {
      return res.status(404).json({ message: 'Lesson not found in this course' });
    }

    const progress = await completeLessonForUser(
      req.user._id,
      courseId,
      lesson._id,
    );

    return res.status(200).json(progress);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course or lesson ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

const getProgressByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const progress = await getOrCreateProgress(req.user._id, courseId);
    progress.lastAccessedAt = new Date();
    await progress.save();

    return res.status(200).json(progress);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

const getMyLearning = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'enrolledCourses',
      populate: { path: 'lessons', select: 'title order' },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const courses = await Promise.all(
      (user.enrolledCourses || []).map(async (course) => {
        const [progress, watchRecords] = await Promise.all([
          Progress.findOne({ user: user._id, course: course._id }),
          WatchProgress.find({ user: user._id, course: course._id })
            .sort({ updatedAt: -1 })
            .populate('lesson', 'title order'),
        ]);

        const lessons = [...(course.lessons || [])].sort(
          (a, b) => (a.order || 0) - (b.order || 0),
        );
        const completedIds = new Set(
          (progress?.completedLessons || []).map((id) => id.toString()),
        );
        const nextLesson =
          lessons.find((lesson) => !completedIds.has(lesson._id.toString())) ||
          null;
        const lastAccessedLesson = watchRecords[0]?.lesson || null;

        return {
          course: {
            _id: course._id,
            title: course.title,
            thumbnail: course.thumbnail,
            category: course.category,
            difficulty: course.difficulty,
          },
          overallPercent: progress?.overallPercent || 0,
          lastAccessedAt:
            progress?.lastAccessedAt || watchRecords[0]?.updatedAt || null,
          lastAccessedLesson,
          nextLesson,
        };
      }),
    );

    return res.status(200).json({ courses });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const recordQuizScore = async (userId, courseId, quizId, score) => {
  const progress = await getOrCreateProgress(userId, courseId);
  const existing = progress.quizScores.find(
    (item) => item.quiz.toString() === quizId.toString(),
  );

  if (existing) {
    if (score > existing.score) {
      existing.score = score;
    }
  } else {
    progress.quizScores.push({ quiz: quizId, score });
  }

  return recalculateOverallPercent(progress);
};

module.exports = {
  markLessonComplete,
  getProgressByCourse,
  getMyLearning,
  recalculateOverallPercent,
  completeLessonForUser,
  recordQuizScore,
  getOrCreateProgress,
};
