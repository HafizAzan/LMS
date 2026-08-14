import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteReview, getReviewsByCourse } from '../services/reviewService';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';

function isSameId(value, otherId) {
  if (!value || !otherId) {
    return false;
  }

  return (value._id || value).toString() === otherId.toString();
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function ReviewList({ courseId, ratingsAverage = 0, ratingsCount = 0, onStatsChange }) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getReviewsByCourse(courseId);
      setReviews(data.reviews || []);
    } catch (err) {
      setReviews([]);
      setError(err.response?.data?.message || 'Unable to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [courseId]);

  const ownReview = reviews.find((review) => isSameId(review.user, user?._id));
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        reviews.length
      : Number(ratingsAverage) || 0;
  const count = reviews.length || Number(ratingsCount) || 0;

  const syncStats = (nextReviews) => {
    const nextCount = nextReviews.length;
    const nextAverage =
      nextCount === 0
        ? 0
        : Math.round(
            (nextReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
              nextCount) *
              10,
          ) / 10;
    onStatsChange?.({
      ratingsAverage: nextAverage,
      ratingsCount: nextCount,
    });
  };

  const handleSaved = (savedReview) => {
    setReviews((prev) => {
      const withoutOwn = prev.filter((review) => !isSameId(review._id, savedReview._id));
      const next = [savedReview, ...withoutOwn];
      syncStats(next);
      return next;
    });
    setEditing(false);
    setActionError('');
  };

  const handleDelete = async (reviewId) => {
    setActionError('');

    try {
      await deleteReview(reviewId);
      setReviews((prev) => {
        const next = prev.filter((review) => !isSameId(review._id, reviewId));
        syncStats(next);
        return next;
      });
      setEditing(false);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Unable to delete review.');
    }
  };

  return (
    <section className="course-section reviews-section">
      <h2>Reviews</h2>
      <div className="reviews-summary">
        <StarRating value={average} readOnly showValue />
        <span className="rating-value">
          ({count} review{count === 1 ? '' : 's'})
        </span>
      </div>

      {loading ? <p>Loading reviews...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {actionError ? <p className="form-error">{actionError}</p> : null}

      {isAuthenticated ? (
        ownReview && !editing ? null : (
          <ReviewForm
            courseId={courseId}
            existingReview={editing ? ownReview : null}
            onSaved={handleSaved}
            onCancel={editing ? () => setEditing(false) : undefined}
          />
        )
      ) : (
        <p>
          <Link to="/login">Log in</Link> to leave a review.
        </p>
      )}

      {!loading && reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul className="review-list">
          {reviews.map((review) => {
            const isOwner = isSameId(review.user, user?._id);
            const author = review.user?.name || 'Student';

            if (isOwner && editing) {
              return null;
            }

            return (
              <li key={review._id} className="review-item">
                <div className="review-item-header">
                  <strong>{author}</strong>
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </div>
                <StarRating value={review.rating} readOnly />
                {review.comment ? <p>{review.comment}</p> : null}
                {isOwner ? (
                  <div className="review-item-actions">
                    <button
                      type="button"
                      className="nav-button"
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="nav-button"
                      onClick={() => handleDelete(review._id)}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default ReviewList;
