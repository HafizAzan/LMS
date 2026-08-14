import { useEffect, useState } from 'react';
import CourseCard from '../components/CourseCard';
import { CourseGridSkeleton } from '../components/Skeletons';
import { getCourses } from '../services/courseService';

const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'];

function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCourses({ limit: 50 });
        const unique = [
          ...new Set(
            (data.courses || [])
              .map((course) => course.category)
              .filter(Boolean),
          ),
        ].sort();
        setCategories(unique);
      } catch {
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError('');

      try {
        const params = { limit: 50 };
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }
        if (category) {
          params.category = category;
        }
        if (difficulty) {
          params.difficulty = difficulty;
        }

        const data = await getCourses(params);
        setCourses(data.courses || []);
      } catch (err) {
        setCourses([]);
        setError(
          err.response?.data?.message || 'Unable to load courses. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [debouncedSearch, category, difficulty]);

  return (
    <main className="page catalog-page">
      <h1>Course catalog</h1>
      <p>Browse courses and filter by title, category, or difficulty.</p>

      <div className="catalog-filters">
        <input
          type="search"
          className="catalog-search"
          placeholder="Search by title"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search courses by title"
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value)}
          aria-label="Filter by difficulty"
        >
          <option value="">All difficulties</option>
          {DIFFICULTY_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {loading ? <CourseGridSkeleton /> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {!loading && !error && courses.length === 0 ? (
        <p className="catalog-status">No courses match your filters.</p>
      ) : null}

      {!loading ? (
        <section className="course-grid">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </section>
      ) : null}
    </main>
  );
}

export default CourseCatalog;
