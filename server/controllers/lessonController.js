const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, duration, order } = req.body;
    const videoFile = req.files?.video?.[0];

    if (!title) {
      return res.status(400).json({ message: 'Please provide a lesson title' });
    }

    if (!videoFile) {
      return res.status(400).json({ message: 'Please upload an MP4 video' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to add lessons to this course',
      });
    }

    const resources = (req.files?.resources || []).map((file) => ({
      name: file.originalname,
      fileUrl: file.path,
    }));

    const lesson = await Lesson.create({
      course: course._id,
      title,
      videoUrl: videoFile.path,
      duration: duration ? Number(duration) : 0,
      order: order ? Number(order) : course.lessons.length + 1,
      resources,
    });

    course.lessons.push(lesson._id);
    await course.save();

    return res.status(201).json(lesson);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createLesson };
