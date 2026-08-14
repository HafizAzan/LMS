import { useState } from 'react';

function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  showValue = false,
}) {
  const [hovered, setHovered] = useState(0);
  const rating = Number(value) || 0;
  const display = hovered || Math.round(rating);
  const interactive = Boolean(onChange) && !readOnly;

  return (
    <div
      className={`star-rating ${interactive ? 'interactive' : ''}`}
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      <div
        className="stars"
        onMouseLeave={() => {
          if (interactive) {
            setHovered(0);
          }
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= display;
          const label = `${star} star${star === 1 ? '' : 's'}`;

          if (!interactive) {
            return (
              <span
                key={star}
                className={`star ${filled ? 'filled' : ''}`}
                aria-hidden="true"
              >
                ★
              </span>
            );
          }

          return (
            <button
              key={star}
              type="button"
              className={`star ${filled ? 'filled' : ''}`}
              aria-label={label}
              onMouseEnter={() => setHovered(star)}
              onFocus={() => setHovered(star)}
              onClick={() => onChange(star)}
            >
              ★
            </button>
          );
        })}
      </div>
      {showValue ? (
        <span className="rating-value">{rating.toFixed(1)}</span>
      ) : null}
    </div>
  );
}

export default StarRating;
