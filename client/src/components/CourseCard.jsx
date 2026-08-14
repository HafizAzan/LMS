import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

function CourseCard({ course }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const instructorName =
    course.instructor?.name || course.instructor?.email || 'Unknown instructor';

  const handleEnroll = (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/courses/${course._id}`);
  };

  return (
    <article className="course-card">
      <Link to={`/courses/${course._id}`} className="course-card-link">
        {course.thumbnail ? (
          <img
            className="course-card-thumb"
            src={course.thumbnail}
            alt=""
          />
        ) : (
          <div className="course-card-thumb placeholder" aria-hidden="true" />
        )}
      </Link>

      <div className="course-card-body">
        <div className="course-card-meta">
          <span className={`difficulty-badge ${course.difficulty || 'beginner'}`}>
            {course.difficulty || 'beginner'}
          </span>
          <span className="course-duration">
            {course.duration || 0} hrs
          </span>
        </div>

        <h2 className="course-card-title">
          <Link to={`/courses/${course._id}`}>{course.title}</Link>
        </h2>
        <p className="course-instructor">{instructorName}</p>
        <StarRating value={course.ratingsAverage} readOnly showValue />
        <p className="course-price">
          {course.price > 0 ? `$${Number(course.price).toFixed(2)}` : 'Free'}
        </p>

        <button type="button" className="enroll-button" onClick={handleEnroll}>
          {course.price > 0 ? 'Buy & enroll' : 'Enroll'}
        </button>
      </div>
    </article>
  );
}

export default CourseCard;
