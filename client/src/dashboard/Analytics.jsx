import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { getCourseAnalytics } from '../services/courseService';

const LIGHT_PIE_COLORS = ['#d9d9d9', '#90caf9', '#64b5f6', '#42a5f5', '#1e88e5', '#1a1a1a'];
const DARK_PIE_COLORS = ['#555555', '#90caf9', '#64b5f6', '#42a5f5', '#1e88e5', '#e3f2fd'];

function Analytics({ courses = [] }) {
  const { isDark } = useTheme();
  const [courseId, setCourseId] = useState(courses[0]?._id || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseId && courses[0]?._id) {
      setCourseId(courses[0]._id);
    }
  }, [courses, courseId]);

  useEffect(() => {
    if (!courseId) {
      setData(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const analytics = await getCourseAnalytics(courseId);
        setData(analytics);
      } catch (err) {
        setData(null);
        setError(err.response?.data?.message || 'Unable to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId]);

  if (!courses.length) {
    return <p>Create a course to see analytics.</p>;
  }

  const quizChartData = (data?.quizScores || []).map((item) => ({
    name: item.name,
    score: item.averageScore,
  }));
  const pieData = (data?.progressDistribution || []).filter((item) => item.value > 0);
  const pieColors = isDark ? DARK_PIE_COLORS : LIGHT_PIE_COLORS;
  const axisColor = isDark ? '#b3b3b3' : '#555555';
  const gridColor = isDark ? '#333333' : '#e5e5e5';
  const barColor = isDark ? '#90caf9' : '#1a1a1a';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1c1c1c' : '#ffffff',
    border: `1px solid ${isDark ? '#333333' : '#e5e5e5'}`,
    color: isDark ? '#f2f2f2' : '#1a1a1a',
  };

  return (
    <section className="instructor-panel">
      <label htmlFor="analytics-course">Course</label>
      <select
        id="analytics-course"
        className="analytics-course-select"
        value={courseId}
        onChange={(event) => setCourseId(event.target.value)}
      >
        {courses.map((course) => (
          <option key={course._id} value={course._id}>
            {course.title}
          </option>
        ))}
      </select>

      {loading ? (
        <div aria-busy="true" aria-label="Loading analytics">
          <div className="analytics-grid">
            {Array.from({ length: 4 }, (_, index) => (
              <article key={index}>
                <div className="skeleton skeleton-line short" />
                <div className="skeleton skeleton-line tiny" />
              </article>
            ))}
          </div>
        </div>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}

      {data ? (
        <>
          <div className="analytics-grid">
            <article>
              <h2>{data.totalEnrolled}</h2>
              <p>Enrolled students</p>
            </article>
            <article>
              <h2>{data.averageProgress}%</h2>
              <p>Average progress</p>
            </article>
            <article>
              <h2>{data.averageQuizScore}%</h2>
              <p>Average quiz score</p>
            </article>
            <article>
              <h2>{data.averageRating.toFixed(1)}</h2>
              <p>Average rating</p>
            </article>
          </div>

          <div className="analytics-charts">
            <div className="chart-card">
              <h3>Quiz scores</h3>
              {quizChartData.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={quizChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" stroke={axisColor} />
                    <YAxis domain={[0, 100]} stroke={axisColor} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="score" fill={barColor} name="Average score" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>No quiz attempts yet.</p>
              )}
            </div>

            <div className="chart-card">
              <h3>Progress distribution</h3>
              {pieData.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ color: axisColor }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p>No enrollment progress yet.</p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default Analytics;
