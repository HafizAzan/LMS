import { Link } from 'react-router-dom';

function Home() {
  return (
    <main className="page catalog-page home-page">
      <section className="home-hero">
        <div>
          <h1>Learn skills that move you forward</h1>
          <p>
            Browse courses, track progress, and learn at your own pace on the
            Online Learning Platform.
          </p>
          <div className="home-actions">
            <Link to="/courses" className="enroll-button learn-link">
              Browse courses
            </Link>
            <Link to="/register" className="nav-button">
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
