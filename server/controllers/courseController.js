const Course = require('../models/Course');
const { enrollUserInCourse } = require('../utils/enrollUser');

const isCourseOwner = (course, userId) =>
  course.instructor.toString() === userId.toString();

const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, price, category, difficulty, duration } =
      req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: 'Please provide title, description, and category',
      });
    }

    const course = await Course.create({
      title,
      description,
      thumbnail,
      price,
      category,
      difficulty,
      duration,
      instructor: req.user._id,
      isPublished: false,
    });

    return res.status(201).json(course);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    const titleQuery = req.query.search || req.query.title;

    if (titleQuery) {
      filter.title = { $regex: titleQuery, $options: 'i' };
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }

    if (req.query.instructor) {
      filter.instructor = req.query.instructor;
    }

    if (req.query.published === 'false') {
      filter.isPublished = false;
    } else if (req.query.published !== 'all') {
      filter.isPublished = { $ne: false };
    }

    const sortKey = req.query.sort;
    const sort =
      sortKey === 'rating'
        ? { ratingsAverage: -1, ratingsCount: -1 }
        : sortKey === 'price_asc'
          ? { price: 1 }
          : sortKey === 'price_desc'
            ? { price: -1 }
            : sortKey === 'popular'
              ? { ratingsCount: -1, enrolledStudents: -1 }
              : { createdAt: -1 };

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Course.countDocuments(filter),
    ]);

    return res.status(200).json({
      courses,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar')
      .populate('lessons');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    return res.status(200).json(course);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!isCourseOwner(course, req.user._id)) {
      return res.status(403).json({
        message: 'Not authorized to update this course',
      });
    }

    const allowedFields = [
      'title',
      'description',
      'thumbnail',
      'price',
      'category',
      'difficulty',
      'duration',
      'isPublished',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    const updatedCourse = await course.save();
    return res.status(200).json(updatedCourse);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!isCourseOwner(course, req.user._id)) {
      return res.status(403).json({
        message: 'Not authorized to delete this course',
      });
    }

    await course.deleteOne();
    return res.status(200).json({ message: 'Course deleted' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.price > 0) {
      return res.status(402).json({
        message: 'This course requires payment. Use checkout to enroll.',
        requiresPayment: true,
        price: course.price,
      });
    }

    const { course: updatedCourse, user, alreadyEnrolled } =
      await enrollUserInCourse(req.user._id, course._id);

    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    return res.status(200).json({
      message: 'Enrolled successfully',
      course: updatedCourse,
      user,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getMyInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('enrolledStudents', 'name email avatar')
      .populate('lessons', 'title order duration')
      .sort({ createdAt: -1 });

    return res.status(200).json({ courses });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const uploadCourseThumbnail = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!isCourseOwner(course, req.user._id)) {
      return res.status(403).json({
        message: 'Not authorized to update this course',
      });
    }

    if (!req.file?.path) {
      return res.status(400).json({ message: 'Please upload a thumbnail image' });
    }

    course.thumbnail = req.file.path;
    await course.save();
    return res.status(200).json(course);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getMyInstructorCourses,
  uploadCourseThumbnail,
};
