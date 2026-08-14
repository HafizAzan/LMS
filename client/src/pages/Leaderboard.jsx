import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard } from '../services/leaderboardService';

function Leaderboard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [rows, setRows] = useState([]);
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
        const data = await getLeaderboard();
        setRows(data.leaderboard || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load the leaderboard.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated]);

  return (
    <main className="page catalog-page">
      <h1>Leaderboard</h1>
      <p>Ranked by completed courses, then average quiz score.</p>

      {loading ? <p>Loading rankings...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!loading && !error && rows.length === 0 ? (
        <p>
          No rankings yet. Complete a course or take a quiz, then check back.{' '}
          <Link to="/courses">Browse courses</Link>
        </p>
      ) : null}

      {rows.length ? (
        <div className="table-wrap">
          <table className="instructor-table leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Learner</th>
                <th>Completed</th>
                <th>Avg quiz</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.userId}
                  className={row.isCurrentUser ? 'current-user-row' : ''}
                >
                  <td>{row.rank || '—'}</td>
                  <td>{row.name}{row.isCurrentUser ? ' (you)' : ''}</td>
                  <td>{row.completedCourses}</td>
                  <td>{row.averageQuizScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}

export default Leaderboard;
