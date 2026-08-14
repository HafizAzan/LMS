import { useState } from 'react';
import StarRating from './StarRating';
import { createReview, updateReview } from '../services/reviewService';

function ReviewForm({ courseId, existingReview, onSaved, onCancel }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!rating) {
      setError('Please select a star rating.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = { course: courseId, rating, comment };
      const saved = existingReview
        ? await updateReview(existingReview._id, payload)
        : await createReview(payload);
      onSaved?.(saved);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>{existingReview ? 'Edit your review' : 'Write a review'}</h3>
      {error ? <p className="form-error">{error}</p> : null}

      <label>Your rating</label>
      <StarRating value={rating} onChange={setRating} />

      <label htmlFor="review-comment">Comment</label>
      <textarea
        id="review-comment"
        rows="4"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="What did you think of this course?"
      />

      <div className="review-form-actions">
        <button type="submit" className="enroll-button" disabled={submitting}>
          {submitting
            ? 'Saving...'
            : existingReview
              ? 'Update review'
              : 'Submit review'}
        </button>
        {existingReview && onCancel ? (
          <button type="button" className="nav-button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default ReviewForm;
