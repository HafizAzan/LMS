const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');

const enrollUserInCourse = async (userId, courseId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  const alreadyEnrolled = course.enrolledStudents.some(
    (studentId) => studentId.toString() === userId.toString(),
  );

  if (alreadyEnrolled) {
    const populated = await Course.findById(course._id)
      .populate('instructor', 'name email avatar')
      .populate('lessons');
    const user = await User.findById(userId).select('-password');
    return { course: populated, user, alreadyEnrolled: true };
  }

  const [updatedCourse, user] = await Promise.all([
    Course.findByIdAndUpdate(
      course._id,
      { $addToSet: { enrolledStudents: userId } },
      { new: true },
    )
      .populate('instructor', 'name email avatar')
      .populate('lessons'),
    User.findByIdAndUpdate(
      userId,
      { $addToSet: { enrolledCourses: course._id } },
      { new: true, select: '-password' },
    ),
  ]);

  await Progress.findOneAndUpdate(
    { user: userId, course: course._id },
    { $setOnInsert: { user: userId, course: course._id, lastAccessedAt: new Date() } },
    { upsert: true, new: true },
  );

  return { course: updatedCourse, user, alreadyEnrolled: false };
};

module.exports = { enrollUserInCourse };
