import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import MyLearning from './pages/MyLearning';
import InstructorDashboard from './dashboard/InstructorDashboard';
import Leaderboard from './pages/Leaderboard';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/courses/:courseId/learn" element={<LessonPage />} />
          <Route path="/courses/:courseId/learn/:lessonId" element={<LessonPage />} />
          <Route path="/courses/:courseId/quiz" element={<QuizPage />} />
          <Route
            path="/courses/:courseId/lessons/:lessonId/quiz"
            element={<QuizPage />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-learning" element={<MyLearning />} />
          <Route path="/dashboard" element={<MyLearning />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/instructor" element={<InstructorDashboard />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
