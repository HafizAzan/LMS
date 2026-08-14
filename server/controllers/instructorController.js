const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Payment = require('../models/Payment');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

const round1 = (value) => Math.round((Number(value) || 0) * 10) / 10;

const bucketForPercent = (percent) => {
  if (percent <= 0) {
    return '0%';
  }
  if (percent <= 25) {
    return '1-25%';
  }
  if (percent <= 50) {
    return '26-50%';
  }
  if (percent <= 75) {
    return '51-75%';
  }
  if (percent < 100) {
    return '76-99%';
  }
  return '100%';
};

const getCourseAnalytics = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to view analytics for this course',
      });
    }

    const [progressRecords, quizzes] = await Promise.all([
      Progress.find({ course: course._id }),
      Quiz.find({ course: course._id }).populate('lesson', 'title'),
    ]);

    const quizIds = quizzes.map((quiz) => quiz._id);
    const attempts = quizIds.length
      ? await QuizAttempt.find({ quiz: { $in: quizIds } })
      : [];

    const totalEnrolled = course.enrolledStudents.length;
    const progressByUser = new Map(
      progressRecords.map((record) => [
        record.user.toString(),
        Number(record.overallPercent) || 0,
      ]),
    );

    const percents = course.enrolledStudents.map(
      (studentId) => progressByUser.get(studentId.toString()) || 0,
    );
    const averageProgress =
      percents.length === 0
        ? 0
        : percents.reduce((sum, value) => sum + value, 0) / percents.length;

    const averageQuizScore =
      attempts.length === 0
        ? 0
        : attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) /
          attempts.length;

    const quizScores = quizzes.map((quiz, index) => {
      const quizAttempts = attempts.filter(
        (attempt) => attempt.quiz.toString() === quiz._id.toString(),
      );
      const average =
        quizAttempts.length === 0
          ? 0
          : quizAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) /
            quizAttempts.length;

      return {
        quizId: quiz._id,
        name: quiz.lesson?.title
          ? `${quiz.lesson.title} quiz`
          : `Quiz ${index + 1}`,
        averageScore: round1(average),
        attempts: quizAttempts.length,
      };
    });

    const bucketOrder = ['0%', '1-25%', '26-50%', '51-75%', '76-99%', '100%'];
    const bucketCounts = Object.fromEntries(bucketOrder.map((key) => [key, 0]));
    percents.forEach((percent) => {
      bucketCounts[bucketForPercent(percent)] += 1;
    });

    const progressDistribution = bucketOrder.map((name) => ({
      name,
      value: bucketCounts[name],
    }));

    return res.status(200).json({
      courseId: course._id,
      title: course.title,
      totalEnrolled,
      averageProgress: round1(averageProgress),
      averageQuizScore: round1(averageQuizScore),
      averageRating: round1(course.ratingsAverage),
      ratingsCount: course.ratingsCount || 0,
      quizScores,
      progressDistribution,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

const getOverview = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    const courseIds = courses.map((course) => course._id);
    const studentIds = new Set();
    let ratingsWeighted = 0;
    let ratingsCount = 0;

    courses.forEach((course) => {
      (course.enrolledStudents || []).forEach((id) => studentIds.add(id.toString()));
      ratingsWeighted += (course.ratingsAverage || 0) * (course.ratingsCount || 0);
      ratingsCount += course.ratingsCount || 0;
    });

    const payments = courseIds.length
      ? await Payment.find({ course: { $in: courseIds }, status: 'paid' })
      : [];
    const totalRevenue =
      payments.reduce((sum, payment) => sum + (payment.amount || 0), 0) / 100;

    return res.status(200).json({
      totalStudents: studentIds.size,
      totalCourses: courses.length,
      drafts: courses.filter((course) => course.isPublished === false).length,
      averageRating: ratingsCount ? round1(ratingsWeighted / ratingsCount) : 0,
      ratingsCount,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getCourseAnalytics, getOverview };
