import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import DownloadCertificateButton from '../components/DownloadCertificateButton';
import { useAuth } from '../context/AuthContext';
import { getMyLearning } from '../services/progressService';
import { LearningListSkeleton } from '../components/Skeletons';

const formatDate = (value) => {
  if (!value) {
    return 'Not started yet';
  }

  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

function MyLearning() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getMyLearning();
        setCourses(data.courses || []);
      } catch (err) {
        setCourses([]);
        setError(
          err.response?.data?.message || 'Unable to load your courses.',
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <main className="page catalog-page">
        <h1>My learning</h1>
        <LearningListSkeleton />
      </main>
    );
  }

  return (
    <main className="page catalog-page">
      <h1>My learning</h1>
      <p>Pick up where you left off.</p>

      {error ? <p className="form-error">{error}</p> : null}

      {!error && courses.length === 0 ? (
        <p>
          You are not enrolled in any courses yet.{' '}
          <Link to="/courses">Browse the catalog</Link>
        </p>
      ) : null}

      <section className="learning-list">
        {courses.map((item) => {
          const courseId = item.course._id;
          const continueLesson = item.nextLesson || item.lastAccessedLesson;
          const continueTo = continueLesson?._id
            ? `/courses/${courseId}/learn/${continueLesson._id}`
            : `/courses/${courseId}/learn`;

          return (
            <article key={courseId} className="learning-card">
              {item.course.thumbnail ? (
                <img
                  className="learning-thumb"
                  src={item.course.thumbnail}
                  alt=""
                />
              ) : (
                <div className="learning-thumb placeholder" aria-hidden="true" />
              )}

              <div className="learning-body">
                <h2>{item.course.title}</h2>
                <p className="course-instructor">
                  Last accessed lesson:{' '}
                  {item.lastAccessedLesson?.title || 'None yet'}
                </p>
                <p className="course-instructor">
                  {formatDate(item.lastAccessedAt)}
                </p>
                <ProgressBar percent={item.overallPercent} />
                <div className="learning-actions">
                  <Link to={continueTo} className="enroll-button learn-link">
                    Continue Learning
                  </Link>
                  {item.overallPercent >= 100 ? (
                    <DownloadCertificateButton
                      courseId={courseId}
                      courseTitle={item.course.title}
                    />
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default MyLearning;
