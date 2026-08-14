import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', closeOnDesktop);
    return () => window.removeEventListener('resize', closeOnDesktop);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            ▣
          </span>
          LMS
        </Link>

        <div
          id="primary-nav"
          className={`nav-links ${menuOpen ? 'open' : ''}`}
        >
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/courses">Courses</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/my-learning">My Learning</NavLink>
              <NavLink to="/leaderboard">Leaderboard</NavLink>
              {user?.role === 'instructor' ? (
                <NavLink to="/instructor">Dashboard</NavLink>
              ) : null}
              <span className="nav-user">{user?.name || user?.email}</span>
              <button type="button" className="nav-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </div>

        <div className="navbar-actions">
          <ThemeToggle />
          <button
            type="button"
            className={`menu-toggle ${menuOpen ? 'open' : ''}`}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
