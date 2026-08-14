import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Footer() {
  const { isAuthenticated, user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">
            ▣
          </span>
          <div>
            <strong>LMS</strong>
            <p>Learn at your own pace.</p>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/courses">Courses</Link>
          {isAuthenticated ? (
            <>
              <Link to="/my-learning">My Learning</Link>
              <Link to="/leaderboard">Leaderboard</Link>
              {user?.role === 'instructor' ? (
                <Link to="/instructor">Dashboard</Link>
              ) : null}
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </div>
      <p className="footer-copy">© {year} Online Learning Platform</p>
    </footer>
  );
}

export default Footer;
