import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import LessonDiscussion from '../components/LessonDiscussion';
import AiAssistant from '../components/AiAssistant';
import { LessonListSkeleton } from '../components/Skeletons';
import { useAuth } from '../context/AuthContext';
import { getCourseById } from '../services/courseService';
import {
  getCourseProgress,
  saveProgress,
} from '../services/progressService';

function isSameId(value, otherId) {
  if (!value || !otherId) {
    return false;
  }

  return (value._id || value).toString() === otherId.toString();
}

function LessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [courseData, progressData] = await Promise.all([
          getCourseById(courseId),
          getCourseProgress(courseId).catch(() => ({ progress: [] })),
        ]);
        setCourse(courseData);
        setProgress(progressData.progress || []);
      } catch (err) {
        setCourse(null);
        setError(err.response?.data?.message || 'Unable to load lessons.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId]);

  const lessons = useMemo(
    () =>
      [...(course?.lessons || [])].sort(
        (a, b) => (a.order || 0) - (b.order || 0),
      ),
    [course],
  );

  const selectedLesson =
    lessons.find((lesson) => isSameId(lesson, lessonId)) || lessons[0] || null;

  useEffect(() => {
    if (!lessonId && selectedLesson?._id) {
      navigate(`/courses/${courseId}/learn/${selectedLesson._id}`, {
        replace: true,
      });
    }
  }, [courseId, lessonId, navigate, selectedLesson]);

  const completedIds = useMemo(
    () =>
      new Set(
        progress
          .filter((item) => item.completed)
          .map((item) => item.lesson.toString()),
      ),
    [progress],
  );

  const selectedProgress = progress.find((item) =>
    isSameId(item.lesson, selectedLesson?._id),
  );

  const handleTimeUpdate = useCallback(
    async ({ currentTime, duration }) => {
      if (!selectedLesson?._id) {
        return;
      }

      try {
        const saved = await saveProgress(selectedLesson._id, {
          position: currentTime,
          duration,
          courseId,
        });

        setProgress((prev) => {
          const withoutCurrent = prev.filter(
            (item) => !isSameId(item.lesson, selectedLesson._id),
          );
          return [...withoutCurrent, saved];
        });
      } catch {
        // Keep playback going if progress save fails.
      }
    },
    [courseId, selectedLesson],
  );

  if (loading) {
    return (
      <main className="page catalog-page lesson-page">
        <div className="skeleton skeleton-line short" />
        <LessonListSkeleton />
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

  const enrolled =
    course.enrolledStudents?.some((studentId) => isSameId(studentId, user?._id)) ||
    isSameId(course.instructor, user?._id);

  if (!enrolled) {
    return (
      <main className="page catalog-page">
        <p>Enroll in this course to watch lessons.</p>
        <Link to={`/courses/${courseId}`}>View course</Link>
      </main>
    );
  }

  return (
    <main className="page catalog-page lesson-page">
      <Link to={`/courses/${courseId}`} className="back-link">
        Back to course
      </Link>
      <h1>{course.title}</h1>

      <div className="lesson-layout">
        <aside className="lesson-sidebar">
          <h2>Lessons</h2>
          {lessons.length === 0 ? (
            <p>No lessons yet.</p>
          ) : (
            <ul>
              {lessons.map((lesson, index) => {
                const isActive = isSameId(lesson, selectedLesson?._id);
                const isComplete = completedIds.has(lesson._id?.toString());

                return (
                  <li key={lesson._id || index}>
                    <Link
                      to={`/courses/${courseId}/learn/${lesson._id}`}
                      className={`lesson-nav-item ${isActive ? 'active' : ''}`}
                    >
                      <span>
                        {index + 1}. {lesson.title || `Lesson ${index + 1}`}
                      </span>
                      {isComplete ? (
                        <span className="lesson-check" aria-label="Completed">
                          ✓
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="lesson-player">
          {selectedLesson ? (
            <>
              <h2>{selectedLesson.title}</h2>
              {selectedLesson.videoUrl ? (
                <VideoPlayer
                  key={selectedLesson._id}
                  src={selectedLesson.videoUrl}
                  startTime={selectedProgress?.position || 0}
                  onTimeUpdate={handleTimeUpdate}
                />
              ) : (
                <p>This lesson does not have a video yet.</p>
              )}
              <Link
                to={`/courses/${courseId}/lessons/${selectedLesson._id}/quiz`}
                className="enroll-button learn-link"
              >
                Take lesson quiz
              </Link>
              <LessonDiscussion
                courseId={courseId}
                lessonId={selectedLesson._id}
              />
            </>
          ) : (
            <p>Select a lesson to start watching.</p>
          )}
        </section>
      </div>
      {selectedLesson ? (
        <AiAssistant courseId={courseId} lessonId={selectedLesson._id} />
      ) : null}
    </main>
  );
}

export default LessonPage;
