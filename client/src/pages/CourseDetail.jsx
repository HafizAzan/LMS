import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollInCourse, getCourseById } from '../services/courseService';
import {
  confirmCheckoutSession,
  createCheckoutSession,
} from '../services/paymentService';
import { getOverallProgress } from '../services/progressService';
import DownloadCertificateButton from '../components/DownloadCertificateButton';
import ReviewList from '../components/ReviewList';
import { LessonItemsSkeleton } from '../components/Skeletons';

function isSameId(value, userId) {
  if (!value || !userId) {
    return false;
  }

  const id = value._id || value;
  return id.toString() === userId.toString();
}

function CourseDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [enrollError, setEnrollError] = useState('');
  const [overallPercent, setOverallPercent] = useState(0);

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getCourseById(id);
        setCourse(data);
      } catch (err) {
        setCourse(null);
        setError(
          err.response?.data?.message || 'Unable to load this course.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id]);

  useEffect(() => {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (payment === 'cancelled') {
      setEnrollError('Payment was cancelled. You can try again when ready.');
      setSearchParams({});
      return;
    }

    if (!sessionId || !isAuthenticated) {
      return;
    }

    const confirm = async () => {
      setEnrolling(true);
      setEnrollError('');
      try {
        const data = await confirmCheckoutSession(sessionId);
        if (data.course) {
          setCourse(data.course);
        }
        if (data.user) {
          updateUser(data.user);
        }
      } catch (err) {
        setEnrollError(
          err.response?.data?.message ||
            'Payment succeeded, but unlocking the course failed. Refresh this page.',
        );
      } finally {
        setEnrolling(false);
        setSearchParams({});
      }
    };

    confirm();
  }, [id, isAuthenticated, searchParams, setSearchParams, updateUser]);

  const enrolled = Boolean(
    course?.enrolledStudents?.some((studentId) => isSameId(studentId, user?._id)) ||
      user?.enrolledCourses?.some((courseId) => isSameId(courseId, course?._id)),
  );

  useEffect(() => {
    if (!isAuthenticated || !enrolled || !id) {
      setOverallPercent(0);
      return;
    }

    getOverallProgress(id)
      .then((data) => setOverallPercent(Number(data.overallPercent) || 0))
      .catch(() => setOverallPercent(0));
  }, [id, isAuthenticated, enrolled]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    setEnrollError('');

    try {
      if (course?.price > 0) {
        const checkout = await createCheckoutSession(id);
        window.location.assign(checkout.url);
        return;
      }

      const data = await enrollInCourse(id);
      setCourse(data.course);
      if (data.user) {
        updateUser(data.user);
      }
    } catch (err) {
      setEnrollError(
        err.response?.data?.message || 'Unable to enroll. Please try again.',
      );
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <main className="page catalog-page">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton course-detail-thumb" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
        <LessonItemsSkeleton />
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="page catalog-page">
        <p className="form-error">{error || 'Course not found.'}</p>
        <Link to="/courses">Back to catalog</Link>
      </main>
    );
  }

  const instructor = course.instructor || {};
  const lessons = course.lessons || [];

  return (
    <main className="page catalog-page course-detail">
      <Link to="/courses" className="back-link">
        Back to catalog
      </Link>

      {course.thumbnail ? (
        <img className="course-detail-thumb" src={course.thumbnail} alt="" />
      ) : (
        <div className="course-detail-thumb placeholder" aria-hidden="true" />
      )}

      <div className="course-card-meta">
        <span className={`difficulty-badge ${course.difficulty || 'beginner'}`}>
          {course.difficulty || 'beginner'}
        </span>
        <span className="course-duration">{course.duration || 0} hrs</span>
      </div>

      <h1>{course.title}</h1>
      <p className="course-category">{course.category}</p>
      <p className="course-price">
        {course.price > 0 ? `$${Number(course.price).toFixed(2)}` : 'Free'}
      </p>

      <section className="course-section">
        <h2>About this course</h2>
        <p className="course-description">{course.description}</p>
      </section>

      <section className="course-section instructor-card">
        <h2>Instructor</h2>
        <div className="instructor-info">
          {instructor.avatar ? (
            <img
              className="instructor-avatar"
              src={instructor.avatar}
              alt=""
            />
          ) : (
            <div className="instructor-avatar placeholder" aria-hidden="true" />
          )}
          <div>
            <p className="instructor-name">
              {instructor.name || 'Unknown instructor'}
            </p>
            {instructor.email ? (
              <p className="course-instructor">{instructor.email}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="course-section">
        <h2>Lessons</h2>
        {lessons.length === 0 ? (
          <p>No lessons have been added yet.</p>
        ) : (
          <ol className="lesson-list">
            {lessons.map((lesson, index) => (
              <li key={lesson._id || lesson}>
                {enrolled && lesson._id ? (
                  <Link to={`/courses/${id}/learn/${lesson._id}`}>
                    {lesson.title || `Lesson ${index + 1}`}
                  </Link>
                ) : (
                  lesson.title || `Lesson ${index + 1}`
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <ReviewList
        courseId={id}
        ratingsAverage={course.ratingsAverage}
        ratingsCount={course.ratingsCount}
        onStatsChange={(stats) =>
          setCourse((prev) => ({ ...prev, ...stats }))
        }
      />

      {enrollError ? <p className="form-error">{enrollError}</p> : null}

      {enrolled ? (
        <>
          <Link to={`/courses/${id}/learn`} className="enroll-button learn-link">
            Continue learning
          </Link>
          <Link to={`/courses/${id}/quiz`} className="nav-button quiz-link">
            Take quiz
          </Link>
          {overallPercent >= 100 ? (
            <DownloadCertificateButton
              courseId={id}
              courseTitle={course.title}
            />
          ) : null}
        </>
      ) : (
        <button
          type="button"
          className="enroll-button"
          onClick={handleEnroll}
          disabled={enrolling}
        >
          {enrolling
            ? course.price > 0
              ? 'Redirecting to checkout...'
              : 'Enrolling...'
            : course.price > 0
              ? `Enroll · $${Number(course.price).toFixed(2)}`
              : 'Enroll for free'}
        </button>
      )}
    </main>
  );
}

export default CourseDetail;
