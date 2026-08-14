const Lesson = require('../models/Lesson');
const WatchProgress = require('../models/WatchProgress');
const { completeLessonForUser } = require('./progressController');

const COMPLETION_THRESHOLD = 0.9;

const saveProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const position = Number(req.body.position) || 0;
    const duration = Number(req.body.duration) || 0;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const courseId = req.body.courseId || lesson.course;
    const existing = await WatchProgress.findOne({
      user: req.user._id,
      lesson: lessonId,
    });

    const reachedEnd =
      duration > 0 && position / duration >= COMPLETION_THRESHOLD;
    const completed = Boolean(existing?.completed || reachedEnd);

    const progress = await WatchProgress.findOneAndUpdate(
      { user: req.user._id, lesson: lessonId },
      {
        user: req.user._id,
        lesson: lessonId,
        course: courseId,
        position,
        completed,
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (completed) {
      await completeLessonForUser(req.user._id, courseId, lesson._id);
    }

    return res.status(200).json(progress);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid lesson ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

const getWatchProgressByCourse = async (req, res) => {
  try {
    const progress = await WatchProgress.find({
      user: req.user._id,
      course: req.params.courseId,
    });

    return res.status(200).json({ progress });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

module.exports = { saveProgress, getWatchProgressByCourse };
