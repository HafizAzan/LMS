import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/app-layout.tsx';
import { GuestOnly, RequireAuth, RequireInstructor } from './components/require-auth.tsx';
import { AuthProvider } from './context/auth-context.tsx';
import Catalog from './pages/catalog.tsx';
import Contact from './pages/contact.tsx';
import CourseDetail from './pages/course-detail.tsx';
import CreateCourse from './pages/instructor/create-course.tsx';
import CourseQuiz from './pages/instructor/course-quiz.tsx';
import ForgotPassword from './pages/forgot-password.tsx';
import InstructorAnalytics from './pages/instructor/instructor-analytics.tsx';
import InstructorHome from './pages/instructor/instructor-home.tsx';
import InstructorStudents from './pages/instructor/instructor-students.tsx';
import Leaderboard from './pages/leaderboard.tsx';
import LessonPage from './pages/lesson-page.tsx';
import Login from './pages/login.tsx';
import MyCourses from './pages/instructor/my-courses.tsx';
import MyLearning from './pages/my-learning.tsx';
import Privacy from './pages/privacy.tsx';
import QuizPage from './pages/quiz-page.tsx';
import Register from './pages/register.tsx';
import ResetPassword from './pages/reset-password.tsx';
import Terms from './pages/terms.tsx';
import VerifyEmail from './pages/verify-email.tsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/courses" replace />} />
              <Route path="/courses" element={<Catalog />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/courses/:courseId/learn" element={<LessonPage />} />
              <Route path="/courses/:courseId/learn/:lessonId" element={<LessonPage />} />
              <Route path="/courses/:courseId/quiz" element={<QuizPage />} />
              <Route path="/courses/:courseId/lessons/:lessonId/quiz" element={<QuizPage />} />
              <Route path="/my-learning" element={<MyLearning />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route element={<RequireInstructor />}>
                <Route path="/instructor" element={<InstructorHome />} />
                <Route path="/instructor/courses" element={<MyCourses />} />
                <Route path="/instructor/courses/new" element={<CreateCourse />} />
                <Route path="/instructor/courses/:id/quiz" element={<CourseQuiz />} />
                <Route path="/instructor/students" element={<InstructorStudents />} />
                <Route path="/instructor/analytics" element={<InstructorAnalytics />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
