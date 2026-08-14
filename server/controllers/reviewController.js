const mongoose = require('mongoose');
const Course = require('../models/Course');
const Review = require('../models/Review');

const isReviewOwner = (review, userId) =>
  review.user.toString() === userId.toString();

const updateCourseRatings = async (courseId) => {
  const [stats] = await Review.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(String(courseId)) } },
    {
      $group: {
        _id: '$course',
        ratingsAverage: { $avg: '$rating' },
        ratingsCount: { $sum: 1 },
      },
    },
  ]);

  await Course.findByIdAndUpdate(courseId, {
    ratingsAverage: stats ? Math.round(stats.ratingsAverage * 10) / 10 : 0,
    ratingsCount: stats ? stats.ratingsCount : 0,
  });
};

const createReview = async (req, res) => {
  try {
    const { course, rating, comment } = req.body;

    if (!course || rating === undefined) {
      return res.status(400).json({
        message: 'Please provide a course and a rating',
      });
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const existing = await Review.findOne({
      user: req.user._id,
      course: courseDoc._id,
    });

    if (existing) {
      return res.status(400).json({
        message: 'You have already reviewed this course',
      });
    }

    const review = await Review.create({
      user: req.user._id,
      course: courseDoc._id,
      rating: numericRating,
      comment,
    });

    await updateCourseRatings(courseDoc._id);

    const populated = await review.populate('user', 'name avatar');
    return res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You have already reviewed this course',
      });
    }

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

const getReviewsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId || req.query.courseId;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const reviews = await Review.find({ course: courseId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json({ reviews });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!isReviewOwner(review, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    if (req.body.rating !== undefined) {
      const numericRating = Number(req.body.rating);
      if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = numericRating;
    }

    if (req.body.comment !== undefined) {
      review.comment = req.body.comment;
    }

    await review.save();
    await updateCourseRatings(review.course);

    const populated = await review.populate('user', 'name avatar');
    return res.status(200).json(populated);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!isReviewOwner(review, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const courseId = review.course;
    await review.deleteOne();
    await updateCourseRatings(courseId);

    return res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getReviewsByCourse,
  updateReview,
  deleteReview,
};
