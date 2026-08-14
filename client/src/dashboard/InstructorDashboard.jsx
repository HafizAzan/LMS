import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  createCourse,
  createLesson,
  deleteCourse,
  getInstructorCourses,
  updateCourse,
  uploadCourseThumbnail,
} from '../services/courseService';
import Analytics from './Analytics';
import { CourseGridSkeleton } from '../components/Skeletons';

const TABS = [
  { id: 'courses', label: 'My Courses' },
  { id: 'create', label: 'Create Course' },
  { id: 'students', label: 'Students' },
  { id: 'analytics', label: 'Analytics' },
];

const emptyBasics = {
  title: '',
  description: '',
  price: 0,
  category: '',
  difficulty: 'beginner',
  duration: 0,
};

function InstructorDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'instructor') {
      navigate('/my-learning');
    }
  }, [isAuthenticated, navigate, user?.role]);

  const loadCourses = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getInstructorCourses();
      setCourses(data.courses || []);
    } catch (err) {
      setCourses([]);
      setError(err.response?.data?.message || 'Unable to load your courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'instructor') {
      loadCourses();
    }
  }, [isAuthenticated, user?.role]);

  if (!isAuthenticated || user?.role !== 'instructor') {
    return null;
  }

  return (
    <main className="page catalog-page instructor-dashboard">
      <h1>Instructor dashboard</h1>
      <p>Manage courses, students, and performance.</p>

      <div className="dashboard-tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={tab === item.id ? 'active' : ''}
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {loading && tab !== 'create' ? <CourseGridSkeleton count={4} /> : null}

      {!loading && tab === 'courses' ? (
        <MyCoursesTab
          courses={courses}
          onChanged={loadCourses}
        />
      ) : null}
      {tab === 'create' ? (
        <CreateCourseWizard
          onPublished={async () => {
            await loadCourses();
            setTab('courses');
          }}
        />
      ) : null}
      {!loading && tab === 'students' ? <StudentsTab courses={courses} /> : null}
      {!loading && tab === 'analytics' ? <Analytics courses={courses} /> : null}
    </main>
  );
}

function MyCoursesTab({ courses, onChanged }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyBasics);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const startEdit = (course) => {
    setEditingId(course._id);
    setEditForm({
      title: course.title || '',
      description: course.description || '',
      price: course.price || 0,
      category: course.category || '',
      difficulty: course.difficulty || 'beginner',
      duration: course.duration || 0,
    });
    setMessage('');
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateCourse(editingId, editForm);
      setEditingId(null);
      await onChanged();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to update course.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteCourse(course._id);
      await onChanged();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to delete course.');
    }
  };

  if (!courses.length) {
    return <p>You have not created any courses yet.</p>;
  }

  return (
    <section className="instructor-panel">
      {message ? <p className="form-error">{message}</p> : null}
      <ul className="instructor-course-list">
        {courses.map((course) => (
          <li key={course._id} className="instructor-course-item">
            {editingId === course._id ? (
              <form className="auth-form" onSubmit={saveEdit}>
                <BasicInfoFields form={editForm} setForm={setEditForm} />
                <div className="review-form-actions">
                  <button type="submit" className="enroll-button" disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="nav-button"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <h2>
                    <Link to={`/courses/${course._id}`}>{course.title}</Link>
                  </h2>
                  <p>
                    {course.enrolledStudents?.length || 0} students ·{' '}
                    {course.lessons?.length || 0} lessons · {course.ratingsAverage || 0}{' '}
                    avg rating
                  </p>
                </div>
                <div className="review-item-actions">
                  <button
                    type="button"
                    className="nav-button"
                    onClick={() => startEdit(course)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="nav-button"
                    onClick={() => handleDelete(course)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function BasicInfoFields({ form, setForm }) {
  const handleChange = (event) => {
    const { name, value, type } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  return (
    <>
      <label htmlFor="title">Title</label>
      <input
        id="title"
        name="title"
        value={form.title}
        onChange={handleChange}
        required
      />

      <label htmlFor="description">Description</label>
      <textarea
        id="description"
        name="description"
        rows="4"
        value={form.description}
        onChange={handleChange}
        required
      />

      <label htmlFor="category">Category</label>
      <input
        id="category"
        name="category"
        value={form.category}
        onChange={handleChange}
        required
      />

      <label htmlFor="difficulty">Difficulty</label>
      <select
        id="difficulty"
        name="difficulty"
        value={form.difficulty}
        onChange={handleChange}
      >
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <label htmlFor="price">Price</label>
      <input
        id="price"
        name="price"
        type="number"
        min="0"
        step="0.01"
        value={form.price}
        onChange={handleChange}
      />

      <label htmlFor="duration">Duration (hours)</label>
      <input
        id="duration"
        name="duration"
        type="number"
        min="0"
        value={form.duration}
        onChange={handleChange}
      />
    </>
  );
}

function CreateCourseWizard({ onPublished }) {
  const [step, setStep] = useState(1);
  const [basics, setBasics] = useState(emptyBasics);
  const [course, setCourse] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [lessonForm, setLessonForm] = useState({
    title: '',
    duration: 0,
    video: null,
    resources: [],
  });
  const [lessons, setLessons] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const saveBasics = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const saved = course
        ? await updateCourse(course._id, basics)
        : await createCourse(basics);
      setCourse(saved);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save course details.');
    } finally {
      setBusy(false);
    }
  };

  const saveThumbnail = async (event) => {
    event.preventDefault();
    if (!course?._id) {
      setError('Save basic info first.');
      return;
    }

    if (!thumbnailFile && !course.thumbnail) {
      setError('Please choose a thumbnail image.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      if (thumbnailFile) {
        const updated = await uploadCourseThumbnail(course._id, thumbnailFile);
        setCourse(updated);
        setThumbnailPreview(updated.thumbnail);
      }
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to upload thumbnail.');
    } finally {
      setBusy(false);
    }
  };

  const addLesson = async (event) => {
    event.preventDefault();
    if (!lessonForm.title || !lessonForm.video) {
      setError('Each lesson needs a title and an MP4 video.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const created = await createLesson(course._id, {
        title: lessonForm.title,
        duration: lessonForm.duration,
        order: lessons.length + 1,
        video: lessonForm.video,
        resources: lessonForm.resources,
      });
      setLessons((prev) => [...prev, created]);
      setLessonForm({ title: '', duration: 0, video: null, resources: [] });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add lesson.');
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    setBusy(true);
    setError('');

    try {
      await onPublished();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to finish publishing.');
      setBusy(false);
    }
  };

  return (
    <section className="instructor-panel">
      <ol className="wizard-steps">
        <li className={step === 1 ? 'active' : ''}>1. Basic info</li>
        <li className={step === 2 ? 'active' : ''}>2. Thumbnail</li>
        <li className={step === 3 ? 'active' : ''}>3. Lessons</li>
        <li className={step === 4 ? 'active' : ''}>4. Publish</li>
      </ol>

      {error ? <p className="form-error">{error}</p> : null}

      {step === 1 ? (
        <form className="auth-form" onSubmit={saveBasics}>
          <BasicInfoFields form={basics} setForm={setBasics} />
          <button type="submit" className="enroll-button" disabled={busy}>
            {busy ? 'Saving...' : 'Save and continue'}
          </button>
        </form>
      ) : null}

      {step === 2 ? (
        <form className="auth-form" onSubmit={saveThumbnail}>
          <label htmlFor="thumbnail">Course thumbnail</label>
          <input
            id="thumbnail"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setThumbnailFile(file);
              setThumbnailPreview(file ? URL.createObjectURL(file) : course?.thumbnail || '');
            }}
          />
          {thumbnailPreview ? (
            <img className="thumbnail-preview" src={thumbnailPreview} alt="" />
          ) : null}
          <div className="review-form-actions">
            <button type="button" className="nav-button" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="submit" className="enroll-button" disabled={busy}>
              {busy ? 'Uploading...' : 'Save and continue'}
            </button>
          </div>
        </form>
      ) : null}

      {step === 3 ? (
        <div>
          {lessons.length ? (
            <ul className="lesson-list">
              {lessons.map((lesson, index) => (
                <li key={lesson._id}>
                  {index + 1}. {lesson.title}
                </li>
              ))}
            </ul>
          ) : (
            <p>No lessons added yet.</p>
          )}

          <form className="auth-form" onSubmit={addLesson}>
            <label htmlFor="lesson-title">Lesson title</label>
            <input
              id="lesson-title"
              value={lessonForm.title}
              onChange={(event) =>
                setLessonForm((prev) => ({ ...prev, title: event.target.value }))
              }
              required
            />

            <label htmlFor="lesson-duration">Duration (seconds)</label>
            <input
              id="lesson-duration"
              type="number"
              min="0"
              value={lessonForm.duration}
              onChange={(event) =>
                setLessonForm((prev) => ({
                  ...prev,
                  duration: Number(event.target.value),
                }))
              }
            />

            <label htmlFor="lesson-video">Video (MP4)</label>
            <input
              id="lesson-video"
              type="file"
              accept="video/mp4"
              onChange={(event) =>
                setLessonForm((prev) => ({
                  ...prev,
                  video: event.target.files?.[0] || null,
                }))
              }
              required
            />

            <label htmlFor="lesson-resources">Resources (PDF/DOCX, optional)</label>
            <input
              id="lesson-resources"
              type="file"
              accept=".pdf,.docx"
              multiple
              onChange={(event) =>
                setLessonForm((prev) => ({
                  ...prev,
                  resources: Array.from(event.target.files || []),
                }))
              }
            />

            <button type="submit" className="enroll-button" disabled={busy}>
              {busy ? 'Uploading lesson...' : 'Add lesson'}
            </button>
          </form>

          <div className="review-form-actions">
            <button type="button" className="nav-button" onClick={() => setStep(2)}>
              Back
            </button>
            <button
              type="button"
              className="enroll-button"
              onClick={() => setStep(4)}
              disabled={!lessons.length}
            >
              Continue to publish
            </button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="publish-summary">
          <h2>Ready to publish</h2>
          <p>
            <strong>{course?.title}</strong> has {lessons.length} lesson
            {lessons.length === 1 ? '' : 's'}.
          </p>
          {course?.thumbnail ? (
            <img className="thumbnail-preview" src={course.thumbnail} alt="" />
          ) : null}
          <div className="review-form-actions">
            <button type="button" className="nav-button" onClick={() => setStep(3)}>
              Back
            </button>
            <button
              type="button"
              className="enroll-button"
              onClick={publish}
              disabled={busy}
            >
              {busy ? 'Publishing...' : 'Publish course'}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function StudentsTab({ courses }) {
  const rows = courses.flatMap((course) =>
    (course.enrolledStudents || []).map((student) => ({
      courseTitle: course.title,
      student,
    })),
  );

  if (!rows.length) {
    return <p>No students have enrolled in your courses yet.</p>;
  }

  return (
    <section className="instructor-panel">
      <div className="table-wrap">
      <table className="instructor-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Email</th>
            <th>Course</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.courseTitle}-${row.student._id}`}>
              <td>{row.student.name}</td>
              <td>{row.student.email}</td>
              <td>{row.courseTitle}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}

export default InstructorDashboard;
