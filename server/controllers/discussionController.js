const Course = require('../models/Course');
const CourseDiscussion = require('../models/CourseDiscussion');

const userFields = 'name email avatar role';

const isEnrolledOrInstructor = (course, userId) => {
  const isInstructor = course.instructor.toString() === userId.toString();
  const isStudent = course.enrolledStudents.some(
    (studentId) => studentId.toString() === userId.toString(),
  );
  return isInstructor || isStudent;
};

const getDiscussions = async (req, res) => {
  try {
    const { courseId, lessonId } = req.query;
    if (!courseId) {
      return res.status(400).json({ message: 'courseId is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!isEnrolledOrInstructor(course, req.user._id)) {
      return res.status(403).json({ message: 'Enroll to view the discussion' });
    }

    const filter = { course: courseId };
    if (lessonId) {
      filter.lesson = lessonId;
    }

    const discussions = await CourseDiscussion.find(filter)
      .populate('user', userFields)
      .populate('replies.user', userFields)
      .sort({ createdAt: -1 });

    return res.json({ discussions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createDiscussion = async (req, res) => {
  try {
    const { courseId, lessonId, message } = req.body;
    if (!courseId || !message?.trim()) {
      return res.status(400).json({ message: 'courseId and message are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!isEnrolledOrInstructor(course, req.user._id)) {
      return res.status(403).json({ message: 'Enroll to post in the discussion' });
    }

    const created = await CourseDiscussion.create({
      course: courseId,
      lesson: lessonId || null,
      user: req.user._id,
      message: message.trim(),
    });

    const discussion = await CourseDiscussion.findById(created._id)
      .populate('user', userFields)
      .populate('replies.user', userFields);

    return res.status(201).json({ discussion });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addReply = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: 'message is required' });
    }

    const thread = await CourseDiscussion.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const course = await Course.findById(thread.course);
    if (!course || !isEnrolledOrInstructor(course, req.user._id)) {
      return res.status(403).json({ message: 'Enroll to reply in the discussion' });
    }

    thread.replies.push({
      user: req.user._id,
      message: message.trim(),
    });
    await thread.save();

    const discussion = await CourseDiscussion.findById(thread._id)
      .populate('user', userFields)
      .populate('replies.user', userFields);

    return res.status(201).json({ discussion });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getDiscussions, createDiscussion, addReply };
